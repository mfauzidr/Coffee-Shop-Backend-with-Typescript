import { QueryResult } from "pg";
import db from "../config/pg";
import { ICart, ICartQueryParams } from "../models/cart";

export const findAll = async ({
  userId = "",
}: ICartQueryParams): Promise<ICart[]> => {
  let whereQuery = "";
  let values: string[] = [];
  if (userId) {
    whereQuery = `WHERE "u"."uuid" = $1`;
    values.push(`${userId}`);
  }
  const query = `
    SELECT
    "u"."uuid" as "userId",
    "p"."name" AS "productName",
    "quantity",
    "ps"."size",
    "pv"."name" AS "variant",
    "c"."subtotal"
    FROM "cart" "c"
    JOIN "users" "u" on "c"."userId" = "u"."uuid"
    JOIN "products" "p" ON "c"."productId" = "p"."uuid"
    JOIN "productSize" "ps" ON "c"."productSizeId" = "ps"."id"
    JOIN "productVariant" "pv" ON "c"."productVariantId" = "pv"."id"
    ${whereQuery}
    `;
  const result: QueryResult<ICart> = await db.query(query, values);
  return result.rows;
};

export const findAllByUid = async ({
  userId = "",
}: ICartQueryParams): Promise<ICart[]> => {
  let values: string[] = [];
  let clause = "";
  if (userId) {
    clause = `WHERE "u"."uuid" = $1`;
    values.push(`${userId}`);
  }
  const query = `
    SELECT
    "u"."uuid" as "userId",
    "p"."name" AS "productName",
    "p"."image",
    "quantity",
    "ps"."size",
    "pv"."name" AS "variant",
    "c"."subtotal"
    FROM "cart" "c"
    JOIN "users" "u" ON "c"."userId" = "u"."uuid"
    JOIN "products" "p" ON "c"."productId" = "p"."uuid"
    JOIN "productSize" "ps" ON "c"."productSizeId" = "ps"."id"
    JOIN "productVariant" "pv" ON "c"."productVariantId" = "pv"."id"
    ${clause}
    ORDER BY COALESCE("c"."updatedAt", "c"."createdAt") DESC;

    `;
  const result: QueryResult<ICart> = await db.query(query, values);
  return result.rows;
};

export const findCartById = async (id: number): Promise<ICart> => {
  const query = `
    SELECT
    "p"."uuid" as "productId",
    "p"."name" AS "productName",
    "quantity",
    "ps"."size",
    "pv"."name" AS "variant",
    "c"."subtotal"
    FROM "cart" "c"
    JOIN "users" "u" on "c"."userId" = "u"."uuid"
    JOIN "products" "p" ON "c"."productId" = "p"."uuid"
    JOIN "productSize" "ps" ON "c"."productSizeId" = "ps"."id"
    JOIN "productVariant" "pv" ON "c"."productVariantId" = "pv"."id"
    WHERE "c"."id" = $1
    `;
  const values: any[] = [id];
  const { rows } = await db.query(query, values);
  return rows[0];
};

export const insert = async (data: any): Promise<ICart> => {
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
        INSERT INTO "cart"
        (${columns.join(", ")})
        VALUES
        (${insertedValues})
        RETURNING *
    `;

  const { rows } = await db.query(query, values);
  return rows[0];
};

export const update = async (id: number, data: any): Promise<ICart> => {
  const columns: string[] = [];
  const values: any[] = [];

  for (let item in data) {
    values.push(data[item]);
    columns.push(`"${item}" = $${values.length}`);
  }

  const query = `
        UPDATE "cart"
        SET ${columns.join(", ")}
        WHERE "id" = $${values.length + 1}
        RETURNING *
    `;

  console.log(query);

  values.push(id);

  console.log(values);

  const { rows } = await db.query(query, values);
  return rows[0];
};

export const deleteCart = async (id: number): Promise<ICart> => {
  const query = `DELETE FROM "cart" WHERE "id" = $1
    RETURNING *`;
  const values: any[] = [id];
  const { rows } = await db.query(query, values);
  return rows[0];
};
