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

export const findOneSize = async (id: number): Promise<ISizes[]> => {
  let query = `
  SELECT "additionalPrice"
  FROM "productSize"
  WHERE id = $1
  `

  const values: any[] = [id]
  const result: QueryResult<ISizes> = await db.query(query, values)
  return result.rows
}
export const findOneVariant = async (id: number): Promise<ISizes[]> => {
  let query = `
  SELECT "additionalPrice"
  FROM "productVariant"
  WHERE id = $1
  `

  const values: any[] = [id]
  const result: QueryResult<ISizes> = await db.query(query, values)
  return result.rows
}