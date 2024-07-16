import { Request, Response } from 'express'
import { findAll, findDetails, insert as insertOrder, update, deleteOrder, totalCount, findAllByUid, totalCountByUid } from "../repositories/orders"
import { insert as insertDetails, update as updateDetails } from '../repositories/orderDetails';
import { IOrderDetailsBody, IOrders, IOrdersBody, IOrdersParams, IOrdersQueryParams } from "../models/orders"
import { IErrResponse, IOrderResponse } from '../models/response';
import paginLink from '../helper/paginLink';
import db from '../config/pg';
import { findOneById } from '../repositories/products';
import { findOneSize, findOneVariant } from '../repositories/sizeAndVariants';


export const getAllOrders = async (req: Request<{}, {}, {}, IOrdersQueryParams>, res: Response<IOrderResponse>) => {
  try {
    let orders: IOrders[]
    let count: number
    if (req.query.userId) {
      orders = await findAllByUid(req.query)
      count = await totalCountByUid(req.query);
    } else {
      orders = await findAll(req.query);
      count = await totalCount(req.query);
    }

    if (orders.length < 1) {
      throw new Error('no_data')
    }
    const limit = req.query.limit
    const currentPage = parseInt((req.query.page as string) || '1');
    const totalData = count
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
      results: orders
    });
  } catch (error) {
    const err = error as IErrResponse
    if (err.message === 'no_data') {
      return res.status(404).json({
        success: false,
        message: 'Data not found'
      })
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const getDetailOrders = async (req: Request<IOrdersParams>, res: Response<IOrderResponse>) => {
  const { uuid } = req.params;
  try {
    const orders = await findDetails(uuid as string);
    console.log(orders)

    if (orders.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Order details not found',
      });
    }
    return res.json({
      success: true,
      message: 'OK',
      results: orders,
    });

  } catch (error) {
    const err = error as IErrResponse

    if (err.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: `Invalid UUID format.`
      })
    }

    console.log(err)
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
};

// export const createOrders = async (req: Request<{}, {}, IOrdersBody>, res: Response<IOrderResponse>) => {
//   try {
//     const orders = await insert(req.body);
//     return res.json({
//       success: true,
//       message: 'Create order successfully',
//       results: orders,
//     });
//   } catch (error) {
//     const err = error as IErrResponse
//     if (err.code === '23502') {
//       return res.status(400).json({
//         success: false,
//         message: `${err.column} Cannot be empty`,
//       });
//     }

//     console.log(err);
//     return res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//     });
//   }
// };

export const createOrders = async (req: Request<{}, {}, IOrderDetailsBody>, res: Response<IOrderResponse>) => {
  const { userId, fullName, email, deliveryAddress, deliveryMethod } = req.body;
  let { productId, sizeId, variantId, qty } = req.body;

  try {
    productId = (typeof productId === 'string') ? productId.split(',').map(Number) : productId;
    sizeId = (typeof sizeId === 'string') ? sizeId.split(',').map(Number) : sizeId;
    variantId = (typeof variantId === 'string') ? variantId.split(',').map(Number) : variantId;
    qty = (typeof qty === 'string') ? qty.split(',').map(Number) : qty;
  } catch (error) {
    return res.status(400).json({
      message: 'Invalid input format for productId, sizeId, variantId, or qty'
    });
  }

  console.log(productId, sizeId, variantId, qty);

  // Pastikan semua input adalah array
  if (!Array.isArray(productId) || !Array.isArray(sizeId) || !Array.isArray(variantId) || !Array.isArray(qty)) {
    return res.status(400).json({
      message: 'ProductId, sizeId, ProductVariantId, and Quantity should be arrays'
    });
  }

  try {
    const client = await db.connect();
    try {
      await client.query("BEGIN");

      const orderData = {
        userId,
        fullName,
        email,
        deliveryAddress,
        deliveryMethod
      };

      const order = await insertOrder(orderData);
      let subtotal = 0;

      // Ambil panjang array productId sebagai acuan untuk iterasi
      const loop = await Promise.all(productId.map(async (productId: number, index: number) => {
        const orderId = order[0].id;
        const productSizeId = sizeId[index];
        const productVariantId = variantId[index];
        const quantity = qty[index];

        const detailData = {
          orderId,
          productId,
          productSizeId,
          productVariantId,
          quantity
        };

        console.log(`Inserting order detail: ${JSON.stringify(detailData)}`)

        await insertDetails(detailData);

        const productResult = await findOneById(productId);
        const sizeResult = await findOneSize(productSizeId);
        const variantResult = await findOneVariant(productVariantId);

        console.log(productResult, sizeResult, variantResult);

        console.log(productResult[0].price, sizeResult[0].additionalPrice, variantResult[0].additionalPrice, quantity);

        subtotal = (productResult[0].price + sizeResult[0].additionalPrice + variantResult[0].additionalPrice) * quantity;

        console.log(subtotal);
      }));

      const data: Partial<IOrders> = {};

      console.log(subtotal);
      const newOrder = await update(order[0].uuid, data);
      await client.query("COMMIT");

      res.status(201).json({
        message: 'Order created successfully',
        results: newOrder
      });
    } catch (error) {
      await client.query("ROLLBACK");
      const err = error as IErrResponse;
      console.log(err);
      res.status(500).json({
        message: 'Error creating order',
        err: err.message
      });
    } finally {
      client.release();
    }
  } catch (error) {
    const err = error as IErrResponse;
    console.log(err);
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        message: `${err.column} Cannot be empty`,
      });
    } else {
      res.status(500).json({
        message: 'Database connection error',
        err: err.message
      });
    }
  }
};


export const updateOrders = async (req: Request<IOrdersParams, {}, IOrdersBody>, res: Response<IOrderResponse>) => {
  const { uuid } = req.params
  const data = {
    ...req.body
  }
  try {
    const orders = await update(uuid, data);
    if (orders.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }
    return res.json({
      success: true,
      message: 'Update Success',
      results: orders,
    });
  } catch (error) {
    const err = error as IErrResponse
    console.error(err)
    if (err.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: `Invalid UUID format.`
      })
    }

    console.error(err);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const deleteOrders = async (req: Request<IOrdersParams>, res: Response<IOrderResponse>) => {
  const { uuid } = req.params

  try {
    const order = await deleteOrder(uuid)

    if (order.length < 1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      })
    }

    return res.json({
      success: true,
      message: 'Delete success',
      results: order,
    })
  } catch (error) {
    const err = error as IErrResponse

    if (err.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: `Invalid UUID format.`
      })
    }

    console.error(JSON.stringify(error))
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    })
  }
};