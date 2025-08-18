import { QueryResult } from "pg";
import db from "../config/pg";
import { IOrders, IOrdersBody, IOrdersQueryParams } from "../models/orders";

// export const totalCount = async ({ userId = "" }): Promise<number> => {
//   let query = `
//     SELECT COUNT(*) as total
//     FROM "orders"
//   `;
//   let values: string[] = [];

//   if (userId) {
//     query += ` WHERE "userId" ILIKE $1`;
//     values.push(`%${userId}%`);
//   }

//   const result: QueryResult<{ total: number }> = await db.query(query, values);
//   return result.rows[0].total;
// };

// export const findAll = async ({
//   userId = "",
//   page = "1",
//   limit = "3",
// }: IOrdersQueryParams): Promise<IOrders[]> => {
//   const offset: number = (parseInt(page) - 1) * parseInt(limit);

//   let findOrderQuery = "";
//   let values: string[] = [];
//   if (userId) {
//     findOrderQuery = `WHERE "userId" ILIKE $1`;
//     values.push(`%${userId}%`);
//   }
//   const query = `SELECT * FROM "orders"
//   ${findOrderQuery}
//   LIMIT ${limit} OFFSET ${offset}
//   `;
//   const result: QueryResult<IOrders> = await db.query(query, values);
//   return result.rows;
// };

export const findDetails = async (uuid: string): Promise<IOrders[]> => {
  const query = `
    SELECT
    "id",
    "image",
    "uuid",
    "orderNumber",
    "fullName",
    "deliveryAddress",
    "deliveryMethod",
    "status",
    "subtotal",
    "createdAt" AS "date"
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

export const totalCount = async ({
  userId = "",
  orderNumber = "",
  status = "",
  deliveryMethod = "",
  startDate = "",
  endDate = "",
}: IOrdersQueryParams): Promise<number> => {
  let query = `
    SELECT COUNT(*) as total
    FROM "orders"
  `;

  let values: string[] = [];
  let conditions: string[] = [];

  if (userId) {
    conditions.push(`"userId" = $${values.length + 1}`);
    values.push(userId);
  }
  if (orderNumber) {
    conditions.push(`"orderNumber" ILIKE $${values.length + 1}`);
    values.push(`%${orderNumber}%`);
  }
  if (status) {
    conditions.push(`"status" = $${values.length + 1}`);
    values.push(status);
  }
  if (deliveryMethod) {
    conditions.push(`"deliveryMethod" = $${values.length + 1}`);
    values.push(deliveryMethod);
  }
  if (startDate && endDate) {
    if (startDate === endDate) {
      conditions.push(`"createdAt"::date = $${values.length + 1}`);
      values.push(startDate);
    } else {
      conditions.push(
        `"createdAt"::date BETWEEN $${values.length + 1} AND $${
          values.length + 2
        }`
      );
      values.push(startDate, endDate);
    }
  }

  if (conditions.length > 0) {
    query += `WHERE ` + conditions.join(" AND ");
  }

  const result: QueryResult<{ total: number }> = await db.query(query, values);
  return result.rows[0].total;
};

export const findAll = async ({
  userId = "",
  status = "",
  deliveryMethod = "",
  startDate = "",
  endDate = "",
  orderNumber = "",
  sortBy = "",
  page = "1",
  limit = "6",
}: IOrdersQueryParams): Promise<IOrders[]> => {
  const offset: number = (parseInt(page) - 1) * parseInt(limit);

  let values: string[] = [];
  let conditions: string[] = [];
  let whereQuery: string = "";

  if (userId) {
    conditions.push(`"userId" = $${values.length + 1}`);
    values.push(userId);
  }
  if (orderNumber) {
    conditions.push(`"orderNumber" ILIKE $${values.length + 1}`);
    values.push(`%${orderNumber}%`);
  }
  if (status) {
    conditions.push(`"status" = $${values.length + 1}`);
    values.push(status);
  }
  if (deliveryMethod) {
    conditions.push(`"deliveryMethod" = $${values.length + 1}`);
    values.push(deliveryMethod);
  }
  if (startDate && endDate) {
    if (startDate === endDate) {
      conditions.push(`"createdAt"::date = $${values.length + 1}`);
      values.push(startDate);
    } else {
      conditions.push(
        `"createdAt"::date BETWEEN $${values.length + 1} AND $${
          values.length + 2
        }`
      );
      values.push(startDate, endDate);
    }
  }

  if (conditions.length > 0) {
    whereQuery += `WHERE ` + conditions.join(" AND ");
  }

  let orderByClause: string = `ORDER BY "createdAt" DESC`;

  switch (sortBy) {
    case "Latest":
      orderByClause = `ORDER BY "createdAt" DESC`;
      break;
    case "Oldest":
      orderByClause = `ORDER BY "createdAt" ASC`;
      break;
    case "Price-ASC":
      orderByClause = `ORDER BY "subtotal" ASC`;
      break;
    case "Price-DESC":
      orderByClause = `ORDER BY "subtotal" DESC`;
      break;
  }

  const query = `
    SELECT *
    FROM "orders"
    ${whereQuery}
    ${orderByClause}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows;
};
