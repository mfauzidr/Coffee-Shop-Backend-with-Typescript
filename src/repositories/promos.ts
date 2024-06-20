import { QueryResult } from "pg"
import db from "../config/pg"
import { IPromos, IPromosBody, IPromosQueryParams } from "../models/promos"

export const findAll = async ({ search = '' }: IPromosQueryParams): Promise<IPromos[]> => {
  let query = `SELECT * FROM "promos"`;
  let values: string[] = []
  if (search) {
    query += `WHERE "name" ILIKE $1`
    values.push(`%${search}%`)
  }
  const result: QueryResult<IPromos> = await db.query(query, values);
  return result.rows;
};

export const findDetails = async (id: number): Promise<IPromos[]> => {
  const query = `SELECT * FROM "promos" WHERE "id" = $1`;
  const values = [id];
  const results: QueryResult<IPromos> = await db.query(query, values);
  return results.rows;
};

export const insert = async (data: IPromosBody): Promise<IPromos[]> => {
  const columns: string[] = []
  const values: any[] = []

  for (const [key, value] of Object.entries(data)) {
    values.push(value)
    columns.push(`"${key}"`)
  }

  const insertedValues: string = values.map((_, index) => `$${index + 1}`).join(', ')

  const query = `
    INSERT INTO "promos"
    (${columns.join(', ')})
    VALUES
    (${insertedValues})
    RETURNING *
  `

  const result: QueryResult<IPromos> = await db.query(query, values)
  return result.rows
};

export const update = async (id: number, data: IPromosBody): Promise<IPromos[]> => {
  const columns: string[] = []
  const values: any[] = [id]
  for (const [key, value] of Object.entries(data)) {
    values.push(value)
    columns.push(`"${key}"=$${values.length}`)
  }

  const query = `
        UPDATE "promos"
        SET ${columns.join(', ')},
        "updatedAt" = now()
        WHERE "id" = $1
        RETURNING *
    `

  const result: QueryResult<IPromos> = await db.query(query, values)
  return result.rows
}

export const deletePromo = async (id: number): Promise<IPromos[]> => {
  const query = `
    DELETE FROM "promos"
    WHERE "id" = $1
    RETURNING *
  `;
  const values = [id];
  const result: QueryResult<IPromos> = await db.query(query, values)
  return result.rows
};