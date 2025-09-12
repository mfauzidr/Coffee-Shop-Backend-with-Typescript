import { QueryResult } from "pg";
import db from "../config/pg";
import {
  IProductImage,
  IProducts,
  IProductsBody,
  IProductsQueryParams,
} from "../models/products";

export const totalCount = async ({
  search = "",
  category = "",
  minPrice = 0,
  maxPrice = Infinity,
}: {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<number> => {
  let query = `
    SELECT COUNT(*) as total
    FROM "products" "p"
    LEFT JOIN "productCategories" "pc" ON "pc"."productId" = "p"."id"
    LEFT JOIN "categories" "c" ON "pc"."categoryId" = "c"."id"
  `;

  let values: (string | number)[] = [];
  let conditions: string[] = [];

  if (search) {
    conditions.push(`"p"."name" ILIKE $${values.length + 1}`);
    values.push(`%${search}%`);
  }

  if (category) {
    const categories = category.split(",").map((cat) => cat.trim());
    const categoryConditions = categories
      .map((_, index) => `"c"."name" ILIKE $${values.length + 1 + index}`)
      .join(" OR ");
    conditions.push(`(${categoryConditions})`);
    values.push(...categories.map((cat) => `%${cat}%`));
  }

  if (minPrice > 0) {
    conditions.push(`"p"."price" >= $${values.length + 1}`);
    values.push(minPrice);
  }

  if (maxPrice < Infinity) {
    conditions.push(`"p"."price" <= $${values.length + 1}`);
    values.push(maxPrice);
  }

  if (conditions.length > 0) {
    query += `WHERE ` + conditions.join(" AND ");
  }

  const result: QueryResult<{ total: number }> = await db.query(query, values);
  return result.rows[0].total;
};

export const findAll = async ({
  search = "",
  category = "",
  minPrice = 0,
  maxPrice = Infinity,
  sortBy = "",
  page = "1",
  limit = "6",
}: IProductsQueryParams): Promise<IProducts[]> => {
  const offset: number = (parseInt(page) - 1) * parseInt(limit);

  let values: (string | number)[] = [];
  let conditions: string[] = [];
  let whereQuery: string = "";

  if (search) {
    conditions.push(`"p"."name" ILIKE $${values.length + 1}`);
    values.push(`%${search}%`);
  }

  if (category) {
    const categories = category.split(",").map((cat) => cat.trim());
    const categoryConditions = categories
      .map((_, index) => `"c"."name" ILIKE $${values.length + 1 + index}`)
      .join(" OR ");
    conditions.push(`(${categoryConditions})`);
    values.push(...categories.map((cat) => `%${cat}%`));
  }

  if (minPrice > 0) {
    conditions.push(`"p"."price" >= $${values.length + 1}`);
    values.push(minPrice);
  }

  if (maxPrice < Infinity) {
    conditions.push(`"p"."price" <= $${values.length + 1}`);
    values.push(maxPrice);
  }

  if (conditions.length > 0) {
    whereQuery = `WHERE ` + conditions.join(" AND ");
  }

  let orderByClause: string = `ORDER BY "p"."id" ASC`;

  switch (sortBy) {
    case "Alphabet":
      orderByClause = `ORDER BY "p"."name" ASC`;
      break;
    case "Oldest":
      orderByClause = `ORDER BY "p"."createdAt" ASC`;
      break;
    case "Latest":
      orderByClause = `ORDER BY "p"."createdAt" DESC`;
      break;
    case "Price-ASC":
      orderByClause = 'ORDER BY "p"."price" ASC';
      break;
    case "Price-DESC":
      orderByClause = 'ORDER BY "p"."price" DESC';
      break;
  }

  const query: string = `
    SELECT
      "p"."id",
      "p"."name" AS "productName",
      "c"."name" AS "category",
      "p"."description",
      "p"."price",
      "p"."discountPrice",
      "p"."uuid",
      "p"."createdAt",
      "p"."updatedAt",
      "pi"."imageUrl" AS "image"
    FROM "products" "p"
    LEFT JOIN "productCategories" "pc" ON "pc"."productId" = "p"."id"
    LEFT JOIN "categories" "c" ON "pc"."categoryId" = "c"."id"
    LEFT JOIN "productImages" "pi" ON "pi"."productUuid" = "p"."uuid" AND "pi"."isPrimary" = true
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
  const columns: string[] = [
    "id",
    "description",
    "price",
    "isRecommended",
    "uuid",
    "createdAt",
  ];
  const selectColumns: string[] = selectedColumns || columns;

  const query = `
    SELECT 
    "p"."name" as "productName",
    ${selectColumns.map((col) => `"p"."${col}" AS "${col}"`).join(", ")},
      "c"."id" AS "categoryId", 
      "pr"."rate" AS "rating",
      "ps"."sizeId" AS "sizeId", 
    COALESCE(
      json_agg(DISTINCT "pi"."imageUrl") FILTER (WHERE "pi"."id" IS NOT NULL),
      '[]'
    ) AS "image"
    FROM "products" "p"
    LEFT JOIN "productCategories" "pc" ON "p"."id" = "pc"."productId"
    LEFT JOIN "categories" "c" ON "pc"."categoryId" = "c"."id"
    LEFT JOIN "productRatings" "pr" ON "p"."id" = "pr"."productId"
    LEFT JOIN "sizeProductRelations" "ps" ON "p"."id" = "ps"."productId"
    LEFT JOIN "productImages" "pi" ON "pi"."productUuid" = "p"."uuid"
    WHERE "p"."uuid" = $1
    GROUP BY "p"."id", "p"."name", "c"."id", "pr"."rate", "ps"."sizeId"
  `;

  const values: string[] = [uuid];
  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows;
};

export const insert = async (data: IProductsBody): Promise<IProducts[]> => {
  const columns: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
    INSERT INTO "products"
    (${columns.join(", ")})
    VALUES
    (${insertedValues})
    RETURNING *
  `;

  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows;
};

export const update = async (
  uuid: string,
  data: Partial<IProductsBody>
): Promise<IProducts[]> => {
  const columns: string[] = [];
  const values: any[] = [uuid];
  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"=$${values.length}`);
  }

  const query = `
        UPDATE "products"
        SET ${columns.join(", ")},
        "updatedAt" = now()
        WHERE "uuid" = $1
        RETURNING *
    `;

  const result: QueryResult<IProducts> = await db.query(query, values);
  return result.rows;
};

export const deleteProduct = async (uuid: string): Promise<IProducts[]> => {
  const query = `
        DELETE FROM "products"
        WHERE "uuid" = $1
        RETURNING *
    `;

  const values = [uuid];
  const result = await db.query<IProducts>(query, values);
  return result.rows;
};

export const findOneById = async (uuid: string): Promise<IProducts[]> => {
  const query = `
    SELECT * from "products"
    WHERE uuid = $1;
    `;
  const values: string[] = [uuid];
  const { rows } = await db.query(query, values);
  return rows;
};

export const insertProductImage = async ({
  productUuid,
  imageUrl,
  isPrimary,
  orderIndex,
}: IProductImage): Promise<IProductImage[]> => {
  const query = `
    INSERT INTO "productImages" ("productUuid", "imageUrl", "isPrimary", "orderIndex")
    VALUES ($1, $2, $3, $4)
  `;
  const values = [productUuid, imageUrl, isPrimary, orderIndex];
  const { rows } = await db.query(query, values);

  return rows;
};
