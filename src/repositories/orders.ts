import { QueryResult } from "pg"
import db from "../config/pg"
import { IOrders, IOrdersBody, IOrdersQueryParams } from "../models/orders"

export const totalCount = async ({ userId = '' }): Promise<number> => {
  let query = `
    SELECT COUNT(*) as total
    FROM "orders"
  `
  let values: string[] = [];

  if (userId) {
    query += ` WHERE "userId" ILIKE $1`;
    values.push(`%${userId}%`);
  }

  const result: QueryResult<{ total: number }> = await db.query(query, values)
  return result.rows[0].total
}

export const findAll = async (
  { userId = '',
    page = '1',
    limit = '3' }
    : IOrdersQueryParams
): Promise<IOrders[]> => {
  const offset: number = (parseInt(page) - 1) * parseInt(limit)

  let findOrderQuery = ''
  let values: string[] = []
  if (userId) {
    findOrderQuery = `WHERE "userId" ILIKE $1`
    values.push(`%${userId}%`)
  }
  const query = `SELECT * FROM "orders"
  ${findOrderQuery}
  LIMIT ${limit} OFFSET ${offset}
  `
  const result: QueryResult<IOrders> = await db.query(query, values)
  return result.rows
}

export const findDetails = async (uuid: string): Promise<IOrders[]> => {
  const query = `
    SELECT
    "o"."userId",
    "p"."name" AS "productName",
    "ps"."size",
    "pv"."name" AS "variant",
    "od"."quantity"
    FROM "orderDetails" "od"
    JOIN "products" "p" ON "od"."productId" = "p"."id"
    JOIN "productSize" "ps" ON "od"."productSizeId" = "ps"."id"
    JOIN "productVariant" "pv" ON "od"."productVariantId" = "pv"."id"
    JOIN "orders" "o" ON "od"."orderId" = "o"."id"
    WHERE "o"."uuid" = $1
    `
  const values: string[] = [uuid]
  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows
}

export const insert = async (data: Partial<IOrdersBody>): Promise<IOrders[]> => {
  const columns: string[] = [];
  const values: any[] = ['On-Process'];

  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues: string = values.map((_, index) => `$${index + 1}`).join(', ');

  const query = `
    INSERT INTO "orders"
    (status, ${columns.join(', ')}, "userId")
    VALUES
    ($1, ${insertedValues.substring(insertedValues.indexOf(',') + 2)}, generate_order_number())
    RETURNING *
  `;

  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows;
};


// export const insert = async (data: IOrdersBody): Promise<IOrders[]> => {
//   const columns: string[] = []
//   const values: any[] = []
//   const productIds: number[] = Array.isArray(data.productId)
//     ? data.productId
//     : (data.productId as string).split(',').map(Number)

//   for (const [key, value] of Object.entries(data)) {
//     if (key !== 'productId') {
//       values.push(value)
//       columns.push(`"${key}"`)
//     }
//   }

//   const productIdPlaceholders: string = productIds.map((_, index) => `$${values.length + index + 1}`).join(', ')

//   const totalQuery = `(SELECT SUM("price") FROM "products" WHERE "id" IN (${productIdPlaceholders}))`

//   values.push(...productIds)

//   const insertedValues: string = values.slice(0, columns.length).map((_, index) => `$${index + 1}`).join(', ')

//   const query = `
//     INSERT INTO "orders" ("userId", ${columns.join(', ')}, "subtotal")
//     VALUES (generate_order_number(), ${insertedValues}, (${totalQuery}))
//     RETURNING *
//   `

//   console.log('Product IDs:', productIds)
//   console.log('Total Query:', totalQuery)
//   console.log('Values:', values)
//   console.log('Query:', query)

//   const result: QueryResult<IOrders> = await db.query(query, values);
//   return result.rows
// }



export const update = async (uuid: string, data: Partial<IOrdersBody>): Promise<IOrders[]> => {
  const columns: string[] = []
  const values: any[] = [uuid]

  for (const [key, value] of Object.entries(data)) {
    // if (key !== 'productId') {
    values.push(value)
    columns.push(`"${key}"=$${values.length}`)
  }
  //   if (key === 'productId') {
  //     const totalValue = (value as string).split(',').map(Number)
  //     values.push(...totalValue)
  //     const totalPlaceholders = totalValue.map((_, index) => `$${values.length - totalValue.length + index + 1}`).join(', ')
  //     columns.push(`"total" = (SELECT SUM("basePrice") FROM "products" WHERE "id" IN (${totalPlaceholders}))`)
  //   }
  // }

  const query = `
    UPDATE "orders"
    SET ${columns.join(', ')}
    WHERE "uuid" = $1
    RETURNING *
  `

  console.log('Values:', values)
  console.log('Query:', query)

  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows
}


export const deleteOrder = async (uuid: string): Promise<IOrders[]> => {
  const query = `DELETE FROM "orders" WHERE "uuid" = $1 RETURNING *`
  const values = [uuid]
  const result: QueryResult<IOrders> = await db.query(query, values);
  return result.rows
}


export const totalCountByUid = async ({ userId = '' }): Promise<number> => {
  let values: string[] = [];

  let clause = '';
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
}


export const findAllByUid = async (
  { userId = '',
    page = '1',
    limit = '6' }
    : IOrdersQueryParams
): Promise<IOrders[]> => {
  const offset: number = (parseInt(page) - 1) * parseInt(limit);

  let values: string[] = [];
  let clause = '';
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
}