import { Request, Response } from "express";
import {
  findAllSize,
  insertProductSize,
} from "./size.repo";
import { IProductSizeBody } from "./size.model";
import { IErrResponse, IProductSizeResponse } from "../../shared/models/response.model";

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
  try {
    const results = await insertProductSize(req.body);
    return res.json({
      success: true,
      message: "Create product category successfully",
      results: results,
    });
  } catch (error) {
    const err = error as IErrResponse;
    console.error(JSON.stringify(error));
    if (err.code === "23502") {
      return res.status(400).json({
        success: false,
        message: `${err.column} cannot be empty`,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


