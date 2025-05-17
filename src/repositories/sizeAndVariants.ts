import { QueryResult } from "pg";
import db from "../config/pg";
import {
  IProductSizeBody,
  IProductSizes,
  ISizes,
  IVariants,
} from "../models/sizeAndVariants";

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
  SELECT *
  FROM "productSize"
  WHERE id = $1
  `;

  const values: any[] = [id];
  const result: QueryResult<ISizes> = await db.query(query, values);
  return result.rows;
};
export const findOneVariant = async (id: number): Promise<ISizes[]> => {
  let query = `
  SELECT *
  FROM "productVariant"
  WHERE id = $1
  `;

  const values: any[] = [id];
  const result: QueryResult<ISizes> = await db.query(query, values);
  return result.rows;
};

export const insertProductSize = async (
  data: IProductSizeBody
): Promise<IProductSizes[]> => {
  const columns: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
    INSERT INTO "sizeProductRelations"
    (${columns.join(", ")})
    VALUES
    (${insertedValues})
    RETURNING *
  `;

  const result: QueryResult<IProductSizes> = await db.query(query, values);
  return result.rows;
};
