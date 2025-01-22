import { Request, Response } from "express";
import {
  findAll,
  findAllByUid,
  findCartById,
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
import { findDetails, findOneById } from "../repositories/products";
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
  console.log({ productId, sizeId, variantId, qty });

  try {
    productId =
      typeof productId === "string"
        ? productId.split(",").map(String)
        : productId;
    sizeId =
      typeof sizeId === "string" ? sizeId.split(",").map(Number) : sizeId;
    variantId =
      typeof variantId === "string"
        ? variantId.split(",").map(Number)
        : variantId;
    qty = typeof qty === "string" ? qty.split(",").map(Number) : qty;
  } catch {
    return res.status(400).json({
      message:
        "Invalid input format for productId, sizeId, variantId, or quantity",
    });
  }
  console.log({ productId, sizeId, variantId, qty });

  if (
    !Array.isArray(productId) ||
    !Array.isArray(sizeId) ||
    !Array.isArray(variantId) ||
    !Array.isArray(qty)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "productId, productSizeId, productVariantId, and quantity should be arrays",
    });
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    try {
      const loop = await Promise.all(
        productId.map(async (productId: string, index: number) => {
          const productSizeId = sizeId[index];
          const productVariantId = variantId[index];
          const quantity = qty[index];

          const productResult = await findDetails(productId);
          const sizeResult = await findOneSize(productSizeId);
          const variantResult = await findOneVariant(productVariantId);

          if (!productResult || !sizeResult || !variantResult) {
            throw new Error("Product, size, or variant not found");
          }

          // Calculate subtotal
          const subtotal =
            (productResult[0].price +
              sizeResult[0].additionalPrice +
              variantResult[0].additionalPrice) *
            quantity;

          // Prepare cart data
          const cartData = {
            userId,
            productId,
            quantity,
            productSizeId,
            productVariantId,
            subtotal,
          };

          console.log(cartData);

          // Insert cart item
          const cart = await insert(cartData);

          //return result to use in res status
          return cart;
        })
      );

      //take return cart here for res status

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        message: "Cart items added successfully",
        results: loop,
      });
    } catch (error) {
      await client.query("ROLLBACK");
      const err = error as IErrResponse;
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Error inserting cart items",
        err: err.message,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    const err = error as IErrResponse;
    console.error(err);
    if (err.code === "23502") {
      return res.status(400).json({
        success: false,
        message: `${err.column} Cannot be empty`,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid input format or processing error",
      });
    }
  }
};

export const updateCart = async (
  req: Request<ICartParams, {}, ICartUpdateBody>, // Gunakan ICartUpdateBody
  res: Response<ICartResponse>
) => {
  const { id } = req.params; // Ambil ID dari params
  const { productSizeId, productVariantId, quantity } = req.body; // Ambil data opsional dari body

  try {
    // Ambil data cart dari database berdasarkan ID
    const existingCart = await findCartById(id);
    if (!existingCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Siapkan data yang akan diperbarui
    const updates: ICartUpdateBody = {};

    // Perbarui hanya field yang dikirim
    if (productSizeId !== undefined) updates.productSizeId = productSizeId;
    if (productVariantId !== undefined)
      updates.productVariantId = productVariantId;
    if (quantity !== undefined) updates.quantity = quantity;

    // Jika ada perubahan yang memengaruhi subtotal, hitung ulang
    if (productSizeId || productVariantId || quantity) {
      const sizeToUse =
        productSizeId !== undefined ? productSizeId : existingCart.sizeId;
      const variantToUse =
        productVariantId !== undefined
          ? productVariantId
          : existingCart.variantId;
      const qtyToUse =
        quantity !== undefined ? Number(quantity) : existingCart.qty;

      // Pastikan productId adalah tipe yang tepat (mengatasi masalah 'string' atau 'number[]')
      const productId = Array.isArray(existingCart.productId)
        ? existingCart.productId[0] // Ambil produk pertama jika array
        : existingCart.productId;

      // Ambil data terkait untuk perhitungan ulang
      const productResult = await findDetails(String(productId)); // Gunakan productId yang sudah disesuaikan
      const sizeResult = await findOneSize(Number(sizeToUse)); // Pastikan sizeId adalah number
      const variantResult = await findOneVariant(Number(variantToUse)); // Pastikan variantId adalah number

      if (!productResult || !sizeResult || !variantResult) {
        return res.status(404).json({
          success: false,
          message: "Product, size, or variant not found",
        });
      }

      // Hitung subtotal baru jika ada perubahan pada qty, size, atau variant
      const newSubtotal =
        (productResult[0].price +
          sizeResult[0].additionalPrice +
          variantResult[0].additionalPrice) *
        Number(qtyToUse);

      // Tambahkan subtotal ke updates
      updates.subtotal = newSubtotal;
    }

    // Perbarui data cart di database
    const updatedCart = await update(Number(id), updates);

    if (!updatedCart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    return res.json({
      success: true,
      message: "Update successful",
    });
  } catch (error) {
    const err = error as IErrResponse;
    console.error(err);

    if (err.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: `Invalid UUID format.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
