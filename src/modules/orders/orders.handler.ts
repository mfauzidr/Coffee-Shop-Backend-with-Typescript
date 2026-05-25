import { Request, Response } from "express";
import {
  findAll,
  findDetails,
  insert as insertOrder,
  update,
  deleteOrder,
  totalCount,
  // findAllByUid,
  // totalCountByUid,
} from "./orders.repo";
import {
  IOrderDetailsBody,
  IOrders,
  IOrdersBody,
  IOrdersParams,
  IOrdersQueryParams,
} from "./orders.model";
import {
  insert as insertDetails,
} from "../../modules/orderDetails/orderDetails.repo";
import { IOrderResponse } from "../../shared/models/response.model";
import paginLink from "../../shared/helper/paginLink";
import db from "../../shared/config/pg";
import { findOneById } from "../../modules/products/products.repo";
import { findOneSize, findOneVariant } from "../../modules/sizes/size.repo";
import { AppError } from "../../shared/helper/appError";

export const getAllOrders = async (
  req: Request<{}, {}, {}, IOrdersQueryParams>,
  res: Response<IOrderResponse>
) => {
  let orders: IOrders[];
  let count: number;
  orders = await findAll(req.query);

  if (orders.length < 1) {
    throw new AppError("NO_DATA", "Orders not found", 404);
  }

  const limit = req.query.limit || 6;
  count = await totalCount(req.query);
  const currentPage = parseInt((req.query.page as string) || "1");
  const totalData = count;
  const totalPage = Math.ceil(totalData / parseInt(limit as string));

  return res.json({
    meta: {
      totalData,
      totalPage,
      currentPage,
      nextPage: currentPage != totalPage ? paginLink(req, "next") : null,
      prevPage: currentPage > 1 ? paginLink(req, "previous") : null,
    },
    message: `List all orders. ${count} data found`,
    results: orders,
  });
};

export const getDetailOrders = async (
  req: Request<IOrdersParams>,
  res: Response<IOrderResponse>
) => {
  const { uuid } = req.params;
  const orders = await findDetails(uuid);

  if (orders.length < 1) {
    throw new AppError("NO_DATA", "Order details not found", 404);
  }

  return res.json({
    success: true,
    message: "OK",
    results: orders,
  });
};

export const createOrders = async (
  req: Request<{}, {}, IOrderDetailsBody>,
  res: Response<IOrderResponse>
) => {
  const { userId, fullName, email, deliveryAddress, deliveryMethod } = req.body;
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
  } catch (error) {
    throw new AppError(
      "INVALID_INPUT",
      "Invalid input format for productId, sizeId, variantId, or qty",
      400,
    );
  }

  if (
    !Array.isArray(productId) ||
    !Array.isArray(sizeId) ||
    !Array.isArray(variantId) ||
    !Array.isArray(qty)
  ) {
    throw new AppError(
      "INVALID_INPUT",
      "ProductId, sizeId, ProductVariantId, and Quantity should be arrays",
      400,
    );
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const orderData = {
      userId,
      fullName,
      email,
      deliveryAddress,
      deliveryMethod,
    };

    const order = await insertOrder(orderData);
    let subtotal = 0;
    let image = "";

    await Promise.all(
      productId.map(async (productId: string, index: number) => {
        const orderId = order[0].id;
        const productSizeId = sizeId[index];
        const productVariantId = variantId[index];
        const quantity = qty[index];

        const detailData = {
          orderId,
          productId,
          productSizeId,
          productVariantId,
          quantity,
        };

        await insertDetails(detailData);

        const productResult = await findOneById(productId);
        const sizeResult = await findOneSize(productSizeId);
        const variantResult = await findOneVariant(productVariantId);

        const total =
          (productResult[0].price +
            sizeResult[0].additionalPrice +
            variantResult[0].additionalPrice) *
          quantity;

        subtotal += total + total * 0.1;
      })
    );

    const data: Partial<IOrders> = { subtotal, image };
    const newOrder = await update(order[0].uuid, data);
    await client.query("COMMIT");

    return res.status(201).json({
      message: "Order created successfully",
      results: newOrder,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const updateOrders = async (
  req: Request<IOrdersParams, {}, IOrdersBody>,
  res: Response<IOrderResponse>
) => {
  const { uuid } = req.params;
  const data = {
    ...req.body,
  };
  const orders = await update(uuid, data);
  if (orders.length < 1) {
    throw new AppError("NOT_FOUND", "Order not found", 404);
  }
  return res.json({
    success: true,
    message: "Update Success",
    results: orders,
  });
};

export const deleteOrders = async (
  req: Request<IOrdersParams>,
  res: Response<IOrderResponse>
) => {
  const { uuid } = req.params;
  const order = await deleteOrder(uuid);

  if (order.length < 1) {
    throw new AppError("NOT_FOUND", "Product not found", 404);
  }

  return res.json({
    success: true,
    message: "Delete success",
    results: order,
  });
};
