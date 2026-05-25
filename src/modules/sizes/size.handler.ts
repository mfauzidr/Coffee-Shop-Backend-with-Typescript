import { Request, Response } from "express";
import {
  findAllSize,
  insertProductSize,
} from "./size.repo";
import { IProductSizeBody } from "./size.model";
import { IProductSizeResponse } from "../../shared/models/response.model";

export const getAllSizes = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const size = await findAllSize();
  return res.json({
    success: true,
    message: "List all size",
    results: size,
  });
};

export const createProductSize = async (
  req: Request<{}, {}, IProductSizeBody>,
  res: Response<IProductSizeResponse>
) => {
  const results = await insertProductSize(req.body);
  return res.json({
    success: true,
    message: "Create product category successfully",
    results: results,
  });
};


