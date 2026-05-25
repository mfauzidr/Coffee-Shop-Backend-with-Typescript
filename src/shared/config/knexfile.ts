import type { Knex } from "knex";
import path from "path";
import * as dotenv from "dotenv";

const envFile =
  process.env.NODE_ENV === "production"
    ? path.resolve(__dirname, "../../../.env.production")
    : path.resolve(__dirname, "../../../.env");

dotenv.config({ path: envFile });

const sanitize = (value: string | undefined) =>
  value?.replace(/^['"]|['"]$/g, "") || value;

const config: { [key: string]: Knex.Config } = {
  development: {
    client: "pg",
    connection: {
      host: sanitize(process.env.DB_HOST),
      user: sanitize(process.env.DB_USER),
      password: sanitize(process.env.DB_PASS),
      database: sanitize(process.env.DB_NAME),
      port: Number(sanitize(process.env.DB_PORT)) || 5432,
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
