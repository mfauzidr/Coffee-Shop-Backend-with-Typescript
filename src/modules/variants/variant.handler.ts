import { findAllVariant } from "./variant.repo";
import { Request, Response } from "express";

export const getAllVariants = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const variant = await findAllVariant();
  return res.json({
    success: true,
    message: "List all variant",
    results: variant,
  });
};