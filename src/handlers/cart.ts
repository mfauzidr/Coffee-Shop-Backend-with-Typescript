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
} from "../repositories/cart";
import {
  ICart,
  ICartBody,
  ICartParams,
  ICartQueryParams,
  ICartUpdateBody,
} from "../models/cart";
import { ICartResponse, IErrResponse } from "../models/response";
import { findDetails } from "../repositories/products";
import { findOneSize, findOneVariant } from "../repositories/sizeAndVariants";
import db from "../config/pg";

export const getAllCartItems = async (
  req: Request<{}, {}, {}, ICartQueryParams>,
  res: Response<ICartResponse>
) => {
  try {
    let cart: ICart[];
    if (req.query.userId) {
      cart = await findAllByUid(req.query);
    } else {
      cart = await findAll(req.query);
    }
    if (cart.length < 1) {
      throw new Error("no_data");
    }

    return res.json({
      success: true,
      message: "List all cart items",
      results: cart,
    });
  } catch (error) {
    const err = error as IErrResponse;
    if (err.message === "no_data") {
      return res.status(404).json({
        success: false,
        message: "Data not found",
      });
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      err: err.message,
    });
  }
};

export const insertCart = async (
  req: Request<{}, {}, ICartBody>,
  res: Response<ICartResponse>
) => {
  const { userId } = req.body;
  let { productId, sizeId, variantId, qty } = req.body;

  try {
    productId =
      typeof productId === "string" ? productId.split(",") : productId;
    sizeId =
      typeof sizeId === "string" ? sizeId.split(",").map(Number) : sizeId;
    variantId =
      typeof variantId === "string"
        ? variantId.split(",").map(Number)
        : variantId;
    qty = typeof qty === "string" ? qty.split(",").map(Number) : qty;
  } catch (err) {
    return res.status(400).json({
      message:
        "Invalid input format for productId, sizeId, variantId, or quantity",
    });
  }

  if (
    !Array.isArray(productId) ||
    !Array.isArray(sizeId) ||
    !Array.isArray(variantId) ||
    !Array.isArray(qty)
  ) {
    return res.status(400).json({
      success: false,
      message: "productId, sizeId, variantId, and qty should all be arrays",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    if (
      productId.length !== sizeId.length ||
      productId.length !== variantId.length ||
      productId.length !== qty.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All input arrays must be of the same length",
      });
    }

    const loop = await Promise.all(
      productId.map(async (prodId: string, index: number) => {
        const productSizeId = sizeId[index];
        const productVariantId = variantId[index];
        const quantity = qty[index];

        let existingCart;
        try {
          existingCart = await findCartDetails(
            prodId,
            userId,
            productSizeId,
            productVariantId
          );
        } catch (err) {
          throw new Error("Error checking existing cart");
        }

        if (
          existingCart &&
          Number(existingCart.sizeId) === Number(productSizeId) &&
          Number(existingCart.variantId) === Number(productVariantId)
        ) {
          const newQty = Number(existingCart.qty) + quantity;

          let productResult, sizeResult, variantResult;
          try {
            [productResult, sizeResult, variantResult] = await Promise.all([
              findDetails(prodId),
              findOneSize(productSizeId),
              findOneVariant(productVariantId),
            ]);
          } catch (err) {
            throw new Error("Error fetching product/size/variant details");
          }

          if (!productResult || !sizeResult || !variantResult) {
            throw new Error("Product, size, or variant not found");
          }

          const newSubtotal =
            (productResult[0].price +
              sizeResult[0].additionalPrice +
              variantResult[0].additionalPrice) *
            newQty;

          const updates: ICartUpdateBody = {
            quantity: newQty,
            subtotal: newSubtotal,
          };

          try {
            const updatedCart = await update(existingCart.id, updates);
            return updatedCart;
          } catch (err) {
            throw new Error("Failed to update cart");
          }
        } else {
          let productResult, sizeResult, variantResult;
          try {
            [productResult, sizeResult, variantResult] = await Promise.all([
              findDetails(prodId),
              findOneSize(productSizeId),
              findOneVariant(productVariantId),
            ]);
          } catch (err) {
            throw new Error("Error fetching product/size/variant details");
          }

          if (!productResult || !sizeResult || !variantResult) {
            throw new Error("Product, size, or variant not found");
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

          try {
            const newCart = await insert(cartData);
            return newCart;
          } catch (err) {
            throw new Error("Failed to insert new cart");
          }
        }
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
    const err = error as IErrResponse;

    return res.status(500).json({
      success: false,
      message: "Error inserting or updating cart items",
      err: err.message,
    });
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
    return res.status(400).json({
      success: false,
      message: "Updates should be a non-empty array",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const results = await Promise.all(
      updates.map(async ({ id, productSizeId, productVariantId, quantity }) => {
        const existingCart = await findCartById(id);
        if (!existingCart) throw new Error(`Cart ID ${id} not found`);

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
          throw new Error(`Invalid product/size/variant for cart ID ${id}`);
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
    const err = error as IErrResponse;
    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Batch update failed",
      err: err.message,
    });
  } finally {
    client.release();
  }
};

export const deleteCarts = async (
  req: Request<ICartParams>,
  res: Response<ICartResponse>
) => {
  const { id } = req.params;

  try {
    const cart = await deleteCart(id);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "cart not found",
      });
    }
    return res.json({
      success: true,
      message: "Delete success",
    });
  } catch (error) {
    const err = error as IErrResponse;
    console.error(JSON.stringify(error));
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const deleteAllCarts = async (
  req: Request<ICartParams>,
  res: Response<ICartResponse>
) => {
  const { userId } = req.params;

  try {
    const cart = await deleteAllCart(userId);
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "cart not found",
      });
    }
    return res.json({
      success: true,
      message: "Delete success",
    });
  } catch (error) {
    const err = error as IErrResponse;
    console.error(JSON.stringify(error));
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
