import { QueryResult } from "pg"
import db from "../config/pg"
import { IUser, IUserBody, IUserQueryParams } from "../models/users"

export const totalCount = async ({ search = '', findBy = '' }): Promise<number> => {
  let query = `SELECT COUNT(*) as total FROM "users"`;
  let values: string[] = [];

  if (findBy === "fullName") {
    query += ` WHERE "fullName" ILIKE $1`;
    values.push(`%${search}%`);
  }

  if (findBy === "role") {
    query += ` WHERE "role" ILIKE $1`;
    values.push(`%${search}%`);
  }

  const result: QueryResult<{ total: number }> = await db.query(query, values);
  return result.rows[0].total;
};

export const findAllUsers = async (
  { findBy = '',
    search = '',
    orderBy = '',
    page = '1',
    limit = '5' }: IUserQueryParams
): Promise<IUser[]> => {
  const offset: number = (parseInt(page) - 1) * parseInt(limit);

  let orderByClause = `ORDER BY "id" ASC`;
  let whereClause: string = '';
  let values: string[] = [];

  if (findBy) {
    switch (findBy) {
      case 'fullName':
        whereClause = `WHERE "fullName" ILIKE $1`;
        values.push(`%${search}%`);
        break;
      case 'role':
        whereClause = `WHERE "role" = $1`;
        values.push(search);
        break;
    }
  }

  switch (orderBy) {
    case 'A-Z':
      orderByClause = `ORDER BY "fullName" ASC`;
      break;
    case 'Z-A':
      orderByClause = `ORDER BY "fullName" DESC`;
      break;
    case 'oldest':
      orderByClause = `ORDER BY "createdAt" ASC`;
      break;
    case 'newest':
      orderByClause = `ORDER BY "createdAt" DESC`;
      break;
  }

  const query = `
    SELECT 
      "fullName", 
      "email",
      "password",
      "phoneNumber",
      "role",
      "image",
      "uuid",
      "createdAt",
      "updatedAt"
    FROM "users"
    ${whereClause}
    ${orderByClause}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows;
};


export const findDetails = async (uuid: string): Promise<IUser[]> => {
  const query = `
    SELECT
      "fullName",
      "email",
      "password",
      "phoneNumber",
      "role",
      "image",
      "uuid",
      "createdAt",
      "updatedAt"
    FROM "users" 
    WHERE "uuid" = $1`
  const values: string[] = [uuid]
  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows
}

export const insert = async (data: IUserBody): Promise<IUser[]> => {
  const columns: string[] = []
  const values: string[] = []
  for (const [key, value] of Object.entries(data)) {
    values.push(value)
    columns.push(`"${key}"`)
  }

  const insertedValues: string = values.map((_, index) => `$${index + 1}`).join(', ')

  const query = `
        INSERT INTO "users"
        (${columns.join(', ')})
        VALUES
        (${insertedValues})
        RETURNING *
    `

  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows
}

export const update = async (uuid: string, data: Partial<IUserBody>): Promise<IUser[]> => {
  const columns: string[] = []
  const values: string[] = [uuid]
  for (const [key, value] of Object.entries(data)) {
    values.push(value)
    columns.push(`"${key}"=$${values.length}`)
  }
  const query = `
        UPDATE "users"
        SET ${columns.join(', ')},
        "updatedAt" = now()
        WHERE "uuid" = $1
        RETURNING *
    `
  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows
}

export const deleteUser = async (uuid: string): Promise<IUser[]> => {
  const query = `
        DELETE FROM "users"
        WHERE "uuid" = $1
        RETURNING *
    `

  const values = [uuid]
  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows
}