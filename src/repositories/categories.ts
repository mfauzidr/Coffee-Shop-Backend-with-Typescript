import { QueryResult } from "pg";
import db from "../config/pg";
import { ICategories } from "../models/categories";

export const findAllCategories = async (): Promise<ICategories[]> => {
  let query = `SELECT * FROM "categories"`;
  const result: QueryResult<ICategories> = await db.query(query);
  return result.rows;
};