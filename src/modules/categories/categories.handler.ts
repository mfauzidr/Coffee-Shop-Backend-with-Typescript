import { Request, Response } from "express";
import {
  findAllCategories,
  insertProductCategory,
} from "./categories.repo";
import { IProductCategoryBody } from "./categories.model";
import { IProductCategoryResponse } from "../../shared/models/response.model";

export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const size = await findAllCategories();
  return res.json({
    success: true,
    message: "List all categories",
    results: size,
  });
};

export const createProductCategories = async (
  req: Request<{}, {}, IProductCategoryBody>,
  res: Response<IProductCategoryResponse>
): Promise<Response> => {
  const results = await insertProductCategory(req.body);
  return res.json({
    success: true,
    message: "Create product category successfully",
    results,
  });
};
