import { IVariants } from "./variant.model";
import { QueryResult } from "pg";
import db from "../../shared/config/pg";

export const findAllVariant = async (): Promise<IVariants[]> => {
  let query = `SELECT * FROM "productVariant"`;
  const result: QueryResult<IVariants> = await db.query(query);
  return result.rows;
};