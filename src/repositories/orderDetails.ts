import { QueryResult } from "pg";
import db from "../config/pg";
import { IOrderDetails } from "../models/orderDetails";

export const findAll = async (): Promise<IOrderDetails[]> => {
  const query = `
    SELECT
    "od"."id",
    "o"."orderNumber",
    "p"."name" AS "productName",
    "ps"."size",
    "pv"."name" AS "variant",
    "od"."quantity"
    FROM "orderDetails" "od"
    JOIN "products" "p" ON "od"."productId" = "p"."uuid"
    JOIN "productSize" "ps" ON "od"."productSizeId" = "ps"."id"
    JOIN "productVariant" "pv" ON "od"."productVariantId" = "pv"."id"
    JOIN "orders" "o" ON "od"."orderId" = "o"."id"
    `;
  const values: any[] = [];
  const { rows } = await db.query(query, values);
  return rows;
};

export const findDetails = async (id: number): Promise<IOrderDetails[]> => {
  const query = `
    SELECT
    "od"."orderId",
    "o"."orderNumber",
    "p"."name" AS "productName",
    "p"."image",
    "ps"."size",
    "pv"."name" AS "variant",
    "od"."quantity"
    FROM "orderDetails" "od"
    JOIN "products" "p" ON "od"."productId" = "p"."uuid"
    JOIN "productSize" "ps" ON "od"."productSizeId" = "ps"."id"
    JOIN "productVariant" "pv" ON "od"."productVariantId" = "pv"."id"
    JOIN "orders" "o" ON "od"."orderId" = "o"."id"
    WHERE "od"."orderId" = $1
    `;
  const values: number[] = [id];
  const results: QueryResult<IOrderDetails> = await db.query(query, values);
  return results.rows;
};

export const insert = async (data: any): Promise<IOrderDetails> => {
  const columns: string[] = [];
  const values: any[] = [];

  for (let item in data) {
    values.push(data[item]);
    columns.push(`"${item}"`);
  }

  const insertedValues = values
    .map((value, index) => `$${index + 1}`)
    .join(", ");

  const query = `
        INSERT INTO "orderDetails"
        (${columns.join(", ")})
        VALUES
        (${insertedValues})
        RETURNING *
    `;

  const { rows } = await db.query(query, values);
  return rows[0];
};

export const update = async (
  uuid: string,
  data: any
): Promise<IOrderDetails> => {
  const columns: string[] = [];
  const values: any[] = [];

  for (let item in data) {
    values.push(data[item]);
    columns.push(`"${item}" = $${values.length}`);
  }

  const query = `
        UPDATE "orderDetails"
        SET ${columns.join(", ")}
        WHERE "id" = $${values.length + 1}
        RETURNING *
    `;

  values.push(uuid);

  const { rows } = await db.query(query, values);
  return rows[0];
};

export const deleteOrderDetail = async (
  id: number
): Promise<IOrderDetails | undefined> => {
  const query = `DELETE FROM "orderDetails" WHERE "id" = $1
    RETURNING *`;
  const values: any[] = [id];
  const { rows } = await db.query(query, values);
  return rows[0];
};
