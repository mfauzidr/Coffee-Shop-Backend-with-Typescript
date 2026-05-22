import { QueryResult } from "pg";
import db from "../../shared/config/pg";
import { IUser, IUserBody, IUserQueryParams } from "../../modules/users/users.model";

type QueryValue = string | number | Date | null;

export const totalCount = async ({
  search = "",
}): Promise<number> => {
  let query = `SELECT COUNT(*) as total FROM "users"`;
  let values: QueryValue[] = [];

  if (search ) {
    query += ` WHERE "fullName" ILIKE $${values.length + 1} OR "role" ILIKE $${values.length + 1}`;
    values.push(`%${search}%`);
  }

  const result: QueryResult<{ total: number }> = await db.query(query, values);
  return result.rows[0].total;
};

export const findAllUsers = async ({
  search = "",
  sortBy,
  order,
  page,
  limit,
}: IUserQueryParams): Promise<IUser[]> => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 5;
  const offset = (pageNum - 1) * limitNum;

  let values: QueryValue[] = [];
  let conditions: string[] = [];
  let whereQuery: string = "";

  if (search){
    conditions.push(`"fullName" ILIKE $${values.length + 1} OR "role" ILIKE $${values.length + 1}`);
    values.push(`%${search}%`)
  }

  if (conditions.length > 0) {
    whereQuery = `AND ` + conditions.join(" AND ");
  }

  let orderByClause = 'ORDER BY "id" ASC'

  if (sortBy && order) {
    orderByClause = `ORDER BY ${sortBy} ${order}`
  }

  const query = `
    SELECT
      "id",
      "fullName", 
      "email",
      "phoneNumber",
      "role",
      "image",
      "uuid",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "users"
    WHERE "isActive" = true ${whereQuery}
    ${orderByClause}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  values.push(limitNum);
  values.push(offset);

  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows;
};

export const findDetails = async (uuid: string): Promise<IUser[]> => {
  const query = `
    SELECT
      "uuid",
      "fullName",
      "email",
      "phoneNumber",
      "role",
      "image",
      "isActive",
      "createdAt",
      "updatedAt"
    FROM "users" 
    WHERE "uuid" = $1 AND "isActive" = true`;
  const values: QueryValue[] = [uuid];
  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows;
};

export const insert = async (data: IUserBody): Promise<IUser[]> => {
  const columns: QueryValue[] = [];
  const values: QueryValue[] = [];
  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"`);
  }

  const insertedValues: string = values
    .map((_, index) => `$${index + 1}`)
    .join(", ");

  const query = `
        INSERT INTO "users"
        (${columns.join(", ")})
        VALUES
        (${insertedValues})
        RETURNING *
    `;

  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows;
};

export const update = async (
  uuid: string,
  data: Partial<IUserBody>,
): Promise<IUser[]> => {
  const columns: QueryValue[] = [];
  const values: QueryValue[] = [uuid];
  for (const [key, value] of Object.entries(data)) {
    values.push(value);
    columns.push(`"${key}"=$${values.length}`);
  }
  const query = `
        UPDATE "users"
        SET ${columns.join(", ")},
        "updatedAt" = now()
        WHERE "uuid" = $1
        RETURNING 
          "uuid",
          "fullName",
          "email",
          "phoneNumber",
          "role",
          "image",
          "isActive",
          "createdAt",
          "updatedAt"
        `;
  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows;
};

export const setActiveUser = async (uuid: string, isActive: boolean): Promise<IUser[]> => {
  const values = [uuid, isActive];
  let deletedAtClause = "";

  if (isActive === true) {
    deletedAtClause = "null";
  } else if (isActive === false) {
    deletedAtClause = "now()";
  }

  const query = `
        UPDATE "users" 
        SET "isActive" = $2,
        "deletedAt" = ${deletedAtClause}
        WHERE "uuid" = $1 
        RETURNING *`;

  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows;
};

export const getPassword = async (uuid: string): Promise<IUser> => {
  const query = `
    SELECT
      "password"
    FROM "users"
    WHERE "uuid" = $1`;
  const values: QueryValue[] = [uuid];
  const { rows }: QueryResult<IUser> = await db.query(query, values);
  return rows[0];
};
