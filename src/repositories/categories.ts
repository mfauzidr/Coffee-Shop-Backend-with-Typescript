import { QueryResult } from "pg";
import db from "../config/pg";
import {
  ICategories,
  IProductCategories,
  IProductCategoryBody,
} from "../models/categories";

export const findAllCategories = async (): Promise<ICategories[]> => {
  let query = `SELECT * FROM "categories"`;
  const result: QueryResult<ICategories> = await db.query(query);
  return result.rows;
};

export const insertProductCategory = async (
  data: IProductCategoryBody
): Promise<IProductCategories[]> => {
  const columns: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
    INSERT INTO "productCategories"
    (${columns.join(", ")})
    VALUES
    (${insertedValues})
    RETURNING *
  `;

  const result: QueryResult<IProductCategories> = await db.query(query, values);
  return result.rows;
};
