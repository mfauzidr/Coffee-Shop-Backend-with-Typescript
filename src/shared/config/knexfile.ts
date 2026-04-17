import type { Knex } from "knex";
import path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../../.env.production") });


const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 5432,
    },
    migrations: {
      directory: path.join(__dirname, "../database/migrations"),
      extension: "ts",
    },
    seeds: {
      directory: path.join(__dirname, "../database/seeds"),
      extension: "ts",
    },
  },
};


export default config;
module.exports = config;
