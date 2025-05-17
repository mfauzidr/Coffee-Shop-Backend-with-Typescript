import { Request, Response } from "express";
import {
  findAllCategories,
  insertProductCategory,
} from "../repositories/categories";
import { IProductCategoryBody } from "../models/categories";
import { IErrResponse, IProductCategoryResponse } from "../models/response";

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const size = await findAllCategories();
  return res.json({
    success: true,
    message: "List all size",
    results: size,
  });
};

export const createProductCategories = async (
  req: Request<{}, {}, IProductCategoryBody>,
  res: Response<IProductCategoryResponse>
) => {
  try {
    const results = await insertProductCategory(req.body);
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
