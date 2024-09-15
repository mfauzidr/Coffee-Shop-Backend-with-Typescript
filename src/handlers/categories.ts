import { Request, Response } from 'express';
import { findAllCategories } from "../repositories/categories";

export const getAllCategories = async (req: Request, res: Response): Promise<Response> => {
  const size = await findAllCategories();
  return res.json({
    success: true,
    message: 'List all size',
    results: size,
  });
};