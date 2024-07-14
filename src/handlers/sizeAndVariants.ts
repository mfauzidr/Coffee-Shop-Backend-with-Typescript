
import { Request, Response } from 'express';
import { findAllSize, findAllVariant } from "../repositories/sizeAndVariants";

export const getAllSizes = async (req: Request, res: Response): Promise<Response> => {
  const size = await findAllSize();
  return res.json({
    success: true,
    message: 'List all size',
    results: size,
  });
};
export const getAllVariants = async (req: Request, res: Response): Promise<Response> => {
  const variant = await findAllVariant();
  return res.json({
    success: true,
    message: 'List all variant',
    results: variant,
  });
};