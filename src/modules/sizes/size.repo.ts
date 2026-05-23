import {
  IProductSizeBody,
  IProductSizes,
  ISizes,
} from "../../modules/sizes/size.model"
import db from "../../shared/config/pg";
import { QueryResult } from "pg";

export const findAllSize = async (): Promise<ISizes[]> => {
  let query = `SELECT * FROM "productSize"`;
  const result: QueryResult<ISizes> = await db.query(query);
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

export const findProductSizeRelation = async (
  productId: number,
): Promise<IProductSizes[]> => {
  const query = `
    SELECT *
    FROM "sizeProductRelations"
    WHERE "productId" = $1
  `;
  const values = [productId];
  const result: QueryResult<IProductSizes> = await db.query(query, values);
  return result.rows;
};

export const updateProductSizeRelation = async (
  productId: number,
  sizeId: number,
): Promise<IProductSizes[]> => {
  const query = `
    UPDATE "sizeProductRelations"
    SET "sizeId" = $2
    WHERE "productId" = $1
    RETURNING *
  `;
  const values = [productId, sizeId];
  const result: QueryResult<IProductSizes> = await db.query(query, values);
  return result.rows;
};
