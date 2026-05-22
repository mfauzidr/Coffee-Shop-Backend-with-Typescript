import { Request, Response } from "express";
import {
  deleteAllCart,
  deleteCart,
  findAll,
  findAllByUid,
  findCartById,
  findCartDetails,
  insert,
  update,
} from "./cart.repo";
import {
  ICart,
  ICartBody,
  ICartParams,
  ICartQueryParams,
  ICartUpdateBody,
} from "./cart.model";
import { findDetails } from "../../modules/products/products.repo";
import { findOneSize, findOneVariant } from "../../modules/sizes/size.repo";
import { ICartResponse, IErrResponse } from "../../shared/models/response.model";
import db from "../../shared/config/pg";
import { AppError } from "../../shared/helper/appError";

const assertValidCartInput = (
  productId: unknown,
  sizeId: unknown,
  variantId: unknown,
  qty: unknown
) => {
  if (
    !Array.isArray(productId) ||
    !Array.isArray(sizeId) ||
    !Array.isArray(variantId) ||
    !Array.isArray(qty)
  ) {
    throw new AppError(
      "INVALID_INPUT",
      "productId, sizeId, variantId, and qty should all be arrays",
      400
    );
  }

  if (
    !productId.every((item) => typeof item === "string") ||
    !sizeId.every(
      (item) => typeof item === "number" && !Number.isNaN(item)
    ) ||
    !variantId.every(
      (item) => typeof item === "number" && !Number.isNaN(item)
    ) ||
    !qty.every((item) => typeof item === "number" && !Number.isNaN(item))
  ) {
    throw new AppError(
      "INVALID_INPUT",
      "productId must be string values and sizeId, variantId, qty must be numeric arrays",
      400
    );
  }
};

export const getAllCartItems = async (
  req: Request<{}, {}, {}, ICartQueryParams>,
  res: Response<ICartResponse>
) => {
    let cart: ICart[];
    if (req.query.userId) {
      cart = await findAllByUid(req.query);
    } else {
      cart = await findAll(req.query);
    }
    if (cart.length < 1) {
      throw new AppError("NO_DATA", "No Data Found", 404);
    }

    return res.json({
      success: true,
      message: "List all cart items",
      results: cart,
    });
  
};

export const insertCart = async (
  req: Request<{}, {}, ICartBody>,
  res: Response<ICartResponse>
) => {
  const { userId } = req.body;
  let { productId, sizeId, variantId, qty } = req.body;

  if (typeof productId === "string") productId = productId.split(",");
  if (typeof sizeId === "string") sizeId = sizeId.split(",").map(Number);
  if (typeof variantId === "string")
    variantId = variantId.split(",").map(Number);
  if (typeof qty === "string") qty = qty.split(",").map(Number);

  assertValidCartInput(productId, sizeId, variantId, qty);

  if (
    productId.length !== sizeId.length ||
    productId.length !== variantId.length ||
    productId.length !== qty.length
  ) {
    throw new AppError(
      "INVALID_INPUT_LENGTH",
      "All input arrays must be of the same length",
      400
    );
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const loop = await Promise.all(
      productId.map(async (prodId: string, index: number) => {
        const productSizeId = sizeId[index];
        const productVariantId = variantId[index];
        const quantity = qty[index];

        const existingCart = await findCartDetails(
          prodId,
          userId,
          productSizeId,
          productVariantId
        );

        const [productResult, sizeResult, variantResult] = await Promise.all([
          findDetails(prodId),
          findOneSize(productSizeId),
          findOneVariant(productVariantId),
        ]);

        if (!productResult || !sizeResult || !variantResult) {
          throw new AppError(
            "NOT_FOUND",
            "Product, size, or variant not found",
            404
          );
        }

        if (
          existingCart &&
          Number(existingCart.sizeId) === Number(productSizeId) &&
          Number(existingCart.variantId) === Number(productVariantId)
        ) {
          const newQty = Number(existingCart.qty) + quantity;

          const newSubtotal =
            (productResult[0].price +
              sizeResult[0].additionalPrice +
              variantResult[0].additionalPrice) *
            newQty;

          const updates: ICartUpdateBody = {
            quantity: newQty,
            subtotal: newSubtotal,
          };

          return await update(existingCart.id, updates);
        }

        const subtotal =
          (productResult[0].price +
            sizeResult[0].additionalPrice +
            variantResult[0].additionalPrice) *
          quantity;

        const cartData = {
          userId,
          productId: prodId,
          quantity,
          productSizeId,
          productVariantId,
          subtotal,
        };

        return await insert(cartData);
      })
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Cart items added successfully",
      results: loop,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof AppError) throw error;

    throw new AppError(
      "INTERNAL_SERVER_ERROR",
      "Error inserting or updating cart items",
      500
    );
  } finally {
    client.release();
  }
};

export const updateCart = async (
  req: Request<{}, {}, { updates: (ICartUpdateBody & { id: number })[] }>,
  res: Response<ICartResponse>
) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    throw new AppError(
      "INVALID_INPUT",
      "Updates should be a non-empty array",
      400
    );
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const results = await Promise.all(
      updates.map(async ({ id, productSizeId, productVariantId, quantity }) => {
        const existingCart = await findCartById(id);
        if (!existingCart) throw new AppError("NOT_FOUND", `Cart ID ${id} not found`, 404);

        const updatesData: ICartUpdateBody = {};

        if (productSizeId) updatesData.productSizeId = productSizeId;
        if (productVariantId) updatesData.productVariantId = productVariantId;
        if (quantity) updatesData.quantity = quantity;

        const sizeToUse = productSizeId ?? existingCart.sizeId;
        const variantToUse = productVariantId ?? existingCart.variantId;
        const qtyToUse = quantity ?? existingCart.qty;
        const productId = Array.isArray(existingCart.productId)
          ? existingCart.productId[0]
          : existingCart.productId;

        const [productResult, sizeResult, variantResult] = await Promise.all([
          findDetails(String(productId)),
          findOneSize(Number(sizeToUse)),
          findOneVariant(Number(variantToUse)),
        ]);

        if (!productResult || !sizeResult || !variantResult) {
          throw new AppError(
            "INVALID_INPUT",
            `Invalid product/size/variant for cart ID ${id}`,
            400
          );
        }

        const newSubtotal =
          (productResult[0].price +
            sizeResult[0].additionalPrice +
            variantResult[0].additionalPrice) *
          Number(qtyToUse);

        updatesData.subtotal = newSubtotal;

        const updatedCart = await update(id, updatesData);
        return updatedCart;
      })
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: "Batch update successful",
      results,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    if (error instanceof AppError) throw error;

    throw new AppError("INTERNAL_SERVER_ERROR", "Batch update failed", 500);
  } finally {
    client.release();
  }
};

export const deleteCarts = async (
  req: Request<ICartParams>,
  res: Response<ICartResponse>
) => {
  const { id } = req.params;

  const cart = await deleteCart(id);
  if (!cart) {
    throw new AppError("NOT_FOUND", "Cart not found", 404);
  }

  return res.json({
    success: true,
    message: "Delete success",
  });
};

export const deleteAllCarts = async (
  req: Request<ICartParams>,
  res: Response<ICartResponse>
) => {
  const { userId } = req.params;

  const cart = await deleteAllCart(userId);
  if (!cart) {
    throw new AppError("NOT_FOUND", "Cart not found", 404);
  }

  return res.json({
    success: true,
    message: "Delete success",
  });
};
