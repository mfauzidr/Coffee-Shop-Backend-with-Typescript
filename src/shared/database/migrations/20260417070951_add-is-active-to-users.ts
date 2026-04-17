import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema
    .hasColumn("users", "isActive")
    .then(function (exist) {
      if (!exist) {
        return knex.schema.table("users", function (t) {
          t.boolean("isActive").defaultTo(true);
          t.timestamp("deletedAt");
        });
      }
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema
    .hasColumn("users", "isActive")
    .then(function (exist) {
      if (exist) {
        return knex.schema.table("users", function (t) {
          t.dropColumns("isActive", "deletedAt");
        });
      }
    });
}

