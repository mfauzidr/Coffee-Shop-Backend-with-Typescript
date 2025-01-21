import { QueryResult } from "pg";
import db from "../config/pg";
import { ICart, ICartQueryParams } from "../models/cart";

export const findAll = async ({
  userId = "",
}: ICartQueryParams): Promise<ICart[]> => {
  let whereQuery = "";
  let values: string[] = [];
  if (userId) {
    whereQuery = `WHERE "u"."uuid" ILIKE $1`;
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
    JOIN "products" "p" ON "c"."productId" = "p"."id"
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
    "quantity",
    "ps"."size",
    "pv"."name" AS "variant",
    "c"."subtotal"
    FROM "cart" "c"
    JOIN "users" "u" on "c"."userId" = "u"."uuid"
    JOIN "products" "p" ON "c"."productId" = "p"."id"
    JOIN "productSize" "ps" ON "c"."productSizeId" = "ps"."id"
    JOIN "productVariant" "pv" ON "c"."productVariantId" = "pv"."id"
    ${clause}
    `;
  const result: QueryResult<ICart> = await db.query(query, values);
  return result.rows;
};

export const findDetails = async (id: number): Promise<ICart> => {
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
    JOIN "products" "p" ON "c"."productId" = "p"."id"
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
        INSERT INTO "orderDetails"
        (${columns.join(", ")})
        VALUES
        (${insertedValues})
        RETURNING *
    `;

  const { rows } = await db.query(query, values);
  return rows[0];
};

// export const update = async (
//   uuid: string,
//   data: any
// ): Promise<ICart | undefined> => {
//   const columns: string[] = [];
//   const values: any[] = [];

//   for (let item in data) {
//     values.push(data[item]);
//     columns.push(`"${item}" = $${values.length}`);
//   }

//   const query = `
//         UPDATE "orderDetails"
//         SET ${columns.join(", ")}
//         WHERE "id" = $${values.length + 1}
//         RETURNING *
//     `;

//   values.push(uuid);

//   const { rows } = await db.query(query, values);
//   return rows[0];
// };

// export const deleteOrderDetail = async (
//   id: number
// ): Promise<ICart | undefined> => {
//   const query = `DELETE FROM "orderDetails" WHERE "id" = $1
//     RETURNING *`;
//   const values: any[] = [id];
//   const { rows } = await db.query(query, values);
//   return rows[0];
// };
