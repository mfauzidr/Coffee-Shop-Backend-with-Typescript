import { Request, Response } from "express";
import {
  findAll,
  findDetails,
  insert,
  deleteOrderDetail,
} from "./orderDetails.repo";
import { IOrderDetails, IOrderDetailsParams } from "./orderDetails.model";
import { IOrderDetailsResponse } from "../../shared/models/response.model";
import { AppError } from "../../shared/helper/appError";

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
  const orders = await findDetails(id);

  if (orders.length < 1) {
    throw new AppError("NO_DATA", "Order details not found", 404);
  }

  return res.json({
    success: true,
    message: "OK",
    results: orders,
  });
};

export const createOrderDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const orderDetails = await insert(req.body);
  return res.json({
    success: true,
    message: "Create orderDetails successfully",
    results: orderDetails,
  });
};

export const deleteOrderDetails = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const id = parseInt(req.params.id);
  const orderDetails = await deleteOrderDetail(id);
  if (!orderDetails) {
    throw new AppError("NOT_FOUND", "orderDetails not found", 404);
  }
  return res.json({
    success: true,
    message: "Delete success",
    results: orderDetails,
  });
};
