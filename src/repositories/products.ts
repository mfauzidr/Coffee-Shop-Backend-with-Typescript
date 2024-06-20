import { QueryResult } from "pg"
import db from "../config/pg"
import { IProducts, IProductsBody, IProductsQueryParams } from "../models/products"

export const totalCount = async ({ search = '', filter = '', minimum = 0, maximum = Infinity }): Promise<number> => {
  let query = `
  SELECT COUNT(*) as total
  FROM "products" "p"
  LEFT JOIN "productCategories" "pc" ON "pc"."productId" = "p"."id"
  LEFT JOIN "categories" "c" ON "pc"."categoryId" = "c"."id"
  LEFT JOIN "productPromos" "pp" ON "pp"."productId" = "p"."id"
  LEFT JOIN "promos" "pr" ON "pp"."promoId" = "pr"."id"`

  let values: (string | number)[] = []
  let conditions: string[] = []

  const filters = [
    { condition: filter === "product name" && search, query: `"p"."name" ILIKE $${values.length + 1}`, value: `%${search}%` },
    { condition: filter === "category" && search, query: `"c"."name" = $${values.length + 1}`, value: `%${search}%` },
    { condition: filter === "promo", query: `"pp"."promoId" IS NOT NULL` },
    { condition: minimum > 0, query: `"p"."price" >= $${values.length + 1}`, value: minimum },
    { condition: maximum < Infinity, query: `"p"."price" <= $${values.length + 1}`, value: maximum }
  ];

  filters.forEach(({ condition, query, value }) => {
    if (condition) {
      conditions.push(query);
      if (value !== undefined) values.push(value);
    }
  });

  if (conditions.length > 0) {
    query += `WHERE ` + conditions.join(' AND ');
  }

  const result: QueryResult<{ total: number }> = await db.query(query, values)
  return result.rows[0].total
}

export const findAll = async (
  { search = '',
    filter = '',
    minimum = 0,
    maximum = Infinity,
    page = '1',
    limit = '6' }: IProductsQueryParams
): Promise<IProducts[]> => {
  const offset: number = (parseInt(page) - 1) * parseInt(limit);

  let values: (string | number)[] = [];
  let conditions: string[] = [];
  let whereQuery: string = '';

  const filters = [
    { condition: filter === "product name" && search, whereQuery: `"p"."name" ILIKE $${values.length + 1}`, value: `%${search}%` },
    { condition: filter === "category" && search, whereQuery: `"c"."name" ILIKE $${values.length + 1}`, value: `%${search}%` },
    { condition: filter === "promo", whereQuery: `"pp"."promoId" IS NOT NULL` },
    { condition: minimum > 0, whereQuery: `"p"."price" >= $${values.length + 1}`, value: minimum },
    { condition: maximum < Infinity, whereQuery: `"p"."price" <= $${values.length + 1}`, value: maximum }
  ];

  filters.forEach(({ condition, whereQuery, value }) => {
    if (condition) {
      conditions.push(whereQuery);
      if (value !== undefined) values.push(value);
    }
  });

  if (conditions.length > 0) {
    whereQuery = `WHERE ` + conditions.join(' AND ');
  }

  let orderByClause: string = `ORDER BY "p"."id" ASC`;

  switch (filter) {
    case 'A-Z':
      orderByClause = `ORDER BY "p"."name" ASC`;
      break;
    case 'Z-A':
      orderByClause = `ORDER BY "p"."name" DESC`;
      break;
    case 'oldest':
      orderByClause = `ORDER BY "p"."createdAt" ASC`;
      break;
    case 'newest':
      orderByClause = `ORDER BY "p"."createdAt" DESC`;
      break;
    case 'priciest':
      orderByClause = `ORDER BY "p"."price" DESC`;
      break;
    case 'cheapest':
      orderByClause = `ORDER BY "p"."price" ASC`;
      break;
  }

  const query: string = `
    SELECT
      "p"."id",
      "p"."name" AS "productName",
      "c"."name" AS "category",
      "p"."description",
      "p"."image",
      "p"."price",
      "pr"."name" AS "promo",
      "p"."discountPrice",
      "p"."uuid",
      "p"."createdAt",
      "p"."updatedAt"
    FROM "products" "p"
    LEFT JOIN "productCategories" "pc" ON "pc"."productId" = "p"."id"
    LEFT JOIN "categories" "c" ON "pc"."categoryId" = "c"."id"
    LEFT JOIN "productPromos" "pp" ON "pp"."productId" = "p"."id"
    LEFT JOIN "promos" "pr" ON "pp"."promoId" = "pr"."id"
    ${whereQuery}
    ${orderByClause}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows;
};


export const findDetails = async (
  uuid: string,
  selectedColumns?: string[]
): Promise<IProducts[]> => {
  const columns: string[] = ["id", "name", "image", "description", "price", "isRecommended", "uuid", "createdAt"]
  const selectColumns: string[] = selectedColumns || columns

  const query = `
    SELECT ${selectColumns.map(col => `"p"."${col}" AS "${col}"`).join(', ')},"c"."name" AS "category", "pr"."rate" AS "rating"
    FROM "products" "p"
    LEFT JOIN "productCategories" "pc" ON "p"."id" = "pc"."productId"
    LEFT JOIN "categories" "c" ON "pc"."categoryId" = "c"."id"
    LEFT JOIN "productRatings" "pr" ON "p"."id" = "pr"."productId"
    WHERE "p"."uuid" = $1
  `

  const values: string[] = [uuid]
  const result: QueryResult<IProducts> = await db.query(query, values)
  return result.rows
}

export const insert = async (data: IProductsBody): Promise<IProducts[]> => {
  const columns: string[] = []
  const values: any[] = []

  for (const [key, value] of Object.entries(data)) {
    values.push(value)
    columns.push(`"${key}"`)
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(', ')

  const query = `
    INSERT INTO "products"
    (${columns.join(', ')})
    VALUES
    (${insertedValues})
    RETURNING *
  `

  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows
}

export const update = async (uuid: string, data: Partial<IProductsBody>): Promise<IProducts[]> => {
  const columns: string[] = []
  const values: any[] = [uuid]
  for (const [key, value] of Object.entries(data)) {
    values.push(value)
    columns.push(`"${key}"=$${values.length}`)
  }

  const query = `
        UPDATE "products"
        SET ${columns.join(', ')},
        "updatedAt" = now()
        WHERE "uuid" = $1
        RETURNING ${columns.join(', ')}
    `

  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows
}

export const deleteProduct = async (uuid: string): Promise<IProducts[]> => {
  const query = `
        DELETE FROM "products"
        WHERE "uuid" = $1
        RETURNING *
    `

  const values = [uuid]
  const result = await db.query<IProducts>(query, values)
  return result.rows
}
