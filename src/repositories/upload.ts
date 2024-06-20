import { QueryResult } from "pg";
import db from "../config/pg"
import { IUpload, IUploadBody } from "../models/upload";

export const uploadUser = async (image: IUploadBody, userId: IUploadBody): Promise<IUpload[]> => {
  const query = `INSERT INTO "userImage" ("imageName", "userId")
  VALUES ($1, $2)`

  const values = [image, userId]

  const results: QueryResult<IUpload> = await db.query(query, values)
  return results.rows
}

export const uploadProduct = async (image: IUploadBody, userId: IUploadBody): Promise<IUpload[]> => {
  const query = `INSERT INTO "productImage" ("imageName", "userId")
  VALUES ($1, $2)`

  const values = [image, userId]

  const results: QueryResult<IUpload> = await db.query(query, values)
  return results.rows
}

