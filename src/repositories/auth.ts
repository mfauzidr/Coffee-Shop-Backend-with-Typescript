import { QueryResult } from "pg";
import db from "../config/pg";
import { IUser, IUserBody } from "../models/users";

export const getEmail = async (email: string): Promise<IUser> => {
  const query = `
    SELECT
      "uuid",
      "email",
      "password",
      "role"
    FROM "users"
    WHERE "email" = $1`
  const values: string[] = [email]
  const { rows }: QueryResult<IUser> = await db.query(query, values)
  return rows[0]
}

export const register = async (data: IUserBody, hashedPassword: string): Promise<IUser[]> => {

  const query = `
        INSERT INTO "users"
        ("fullName", "email", "password", "role")
        VALUES
        ($1, $2, $3, 'customer')
        RETURNING "fullName", "email", "uuid", "role"
    `

  const { fullName, email } = data
  const values = [fullName, email, hashedPassword]
  const result: QueryResult<IUser> = await db.query(query, values);
  return result.rows
}