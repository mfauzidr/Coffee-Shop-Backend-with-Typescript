import { QueryResult } from "pg";
import db from "../config/pg";
import { IOrders, IOrdersBody, IOrdersQueryParams } from "../models/orders";

export const totalCount = async ({ userId = "" }): Promise<number> => {
  let query = `
    SELECT COUNT(*) as total
    FROM "orders"
  `;
  let values: string[] = [];

  if (userId) {
    query += ` WHERE "userId" ILIKE $1`;
    values.push(`%${userId}%`);
  }

  const result: QueryResult<{ total: number }> = await db.query(query, values);
  return result.rows[0].total;
};

export const findAll = async ({
  userId = "",
  page = "1",
  limit = "3",
}: IOrdersQueryParams): Promise<IOrders[]> => {
  const offset: number = (parseInt(page) - 1) * parseInt(limit);

  let findOrderQuery = "";
  let values: string[] = [];
  if (userId) {
    findOrderQuery = `WHERE "userId" ILIKE $1`;
    values.push(`%${userId}%`);
  }
  const query = `SELECT * FROM "orders"
  ${findOrderQuery}
  LIMIT ${limit} OFFSET ${offset}
  `;
  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows;
};

export const findDetails = async (uuid: string): Promise<IOrders[]> => {
  const query = `
    SELECT
    "id",
    "uuid",
    "orderNumber",
    "fullName",
    "deliveryAddress",
    "deliveryMethod",
    "status",
    "subtotal"
    FROM "orders"
    WHERE "uuid" = $1
    `;
  const values = [uuid];
  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows;
};

export const insert = async (
  data: Partial<IOrdersBody>
): Promise<IOrders[]> => {
  const columns: string[] = ['"status"'];
  const values: any[] = ["On-Process"];
  if (data.userId) {
    columns.push('"userId"');
    values.push(data.userId);
  }

  for (const [key, value] of Object.entries(data)) {
    if (key !== "userId") {
      values.push(value);
      columns.push(`"${key}"`);
    }
  }

  const insertedValues: string = values
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  const query = `
    INSERT INTO "orders"
    (${columns.join(", ")}, "orderNumber")
    VALUES
    (${insertedValues}, generate_order_number())
    RETURNING *
  `;

  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows;
};

export const update = async (
  uuid: string,
  data: Partial<IOrdersBody>
): Promise<IOrders[]> => {
  const columns: string[] = [];
  const values: any[] = [uuid];

  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"=$${values.length}`);
  }

  const query = `
    UPDATE "orders"
    SET ${columns.join(", ")}
    WHERE "uuid" = $1
    RETURNING *
  `;

  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows;
};

export const deleteOrder = async (uuid: string): Promise<IOrders[]> => {
  const query = `DELETE FROM "orders" WHERE "uuid" = $1 RETURNING *`;
  const values = [uuid];
  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows;
};

export const totalCountByUid = async ({ userId = "" }): Promise<number> => {
  let values: string[] = [];

  let clause = "";
  if (userId) {
    clause += ` WHERE "userId" = $1`;
    values.push(`${userId}`);
  }
  let query = `
    SELECT COUNT(*) as total
    FROM "orders"
    ${clause}
  `;

  const result: QueryResult<{ total: number }> = await db.query(query, values);
  return result.rows[0].total;
};

export const findAllByUid = async ({
  userId = "",
  page = "1",
  limit = "6",
}: IOrdersQueryParams): Promise<IOrders[]> => {
  const offset: number = (parseInt(page) - 1) * parseInt(limit);

  let values: string[] = [];
  let clause = "";
  if (userId) {
    clause += ` WHERE "userId" = $1`;
    values.push(`${userId}`);
  }
  const query = `
    SELECT *
    FROM "orders"
    ${clause}
    ORDER BY "createdAt" DESC
    LIMIT $2 OFFSET $3
  `;
  values.push(`${limit}`, `${offset}`);

  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows;
};
