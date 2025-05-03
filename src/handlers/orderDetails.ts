import { Request, Response } from "express";
import {
  findAll,
  findDetails,
  insert,
  deleteOrderDetail,
} from "../repositories/orderDetails";
import { IOrderDetails, IOrderDetailsParams } from "../models/orderDetails";
import { IErrResponse, IOrderDetailsResponse } from "../models/response";

export const getAllOrderDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const orderDetails = await findAll();
  return res.json({
    success: true,
    message: "List all orderDetails",
    results: orderDetails,
  });
};

export const getDetailOrderDetails = async (
  req: Request<IOrderDetailsParams>,
  res: Response<IOrderDetailsResponse>
) => {
  const { id } = req.params;
  try {
    let orders: IOrderDetails[];
    orders = await findDetails(id);

    if (orders.length < 1) {
      throw new Error("no_data");
    }
    return res.json({
      success: true,
      message: "OK",
      results: orders,
    });
  } catch (error) {
    const err = error as IErrResponse;

    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const createOrderDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const orderDetails = await insert(req.body);
    return res.json({
      success: true,
      message: "Create orderDetails successfully",
      results: orderDetails,
    });
  } catch (error) {
    const err = error as {
      code?: string;
      column?: string;
      detail?: string;
      message: string;
    };
    console.log(JSON.stringify(err));
    if (err.code === "23502") {
      return res.status(400).json({
        success: false,
        message: `${err.column} Cannot be empty`,
      });
    }
    if (err.code === "22P02") {
      return res.status(400).json({
        success: false,
        message: `${err.column} must be filled with an integer type. Please see the table for guidance`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const deleteOrderDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id);
  const orderDetails = await deleteOrderDetail(id);
  if (!orderDetails) {
    return res.status(404).json({
      success: false,
      message: "orderDetails not found",
    });
  }
  return res.json({
    success: true,
    message: "Delete success",
    results: orderDetails,
  });
};
