import { Request, Response } from 'express'
import { findAll, findDetails, insert, update, deleteOrder, totalCount } from "../repositories/orders"
import { IOrdersBody, IOrdersParams, IOrdersQueryParams } from "../models/orders"
import { IErrResponse, IOrderResponse } from '../models/response';
import paginLink from '../helper/paginLink';

export const getAllOrders = async (req: Request<{}, {}, {}, IOrdersQueryParams>, res: Response<IOrderResponse>) => {
  try {
    const orders = await findAll(req.query);
    if (orders.length < 1) {
      throw new Error('no_data')
    }
    const limit = req.query.limit
    const count = await totalCount(req.query);
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

export const createOrders = async (req: Request<{}, {}, IOrdersBody>, res: Response<IOrderResponse>) => {
  try {
    const orders = await insert(req.body);
    return res.json({
      success: true,
      message: 'Create order successfully',
      results: orders,
    });
  } catch (error) {
    const err = error as IErrResponse
    if (err.code === '23502') {
      return res.status(400).json({
        success: false,
        message: `${err.column} Cannot be empty`,
      });
    }

    console.log(err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
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