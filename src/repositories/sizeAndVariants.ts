import { QueryResult } from "pg";
import db from "../config/pg";
import { ISizes, IVariants } from "../models/sizeAndVariants";

export const findAllSize = async (): Promise<ISizes[]> => {
  let query = `SELECT * FROM "productSize"`;
  const result: QueryResult<ISizes> = await db.query(query);
  return result.rows;
};

export const findAllVariant = async (): Promise<IVariants[]> => {
  let query = `SELECT * FROM "productVariant"`;
  const result: QueryResult<IVariants> = await db.query(query);
  return result.rows;
};