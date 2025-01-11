/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table("users", function (table) {
    table.enum("status", ["active", "banned"]).defaultTo("active");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table("users", function (table) {
    table.dropColumn("status");
  });
}
