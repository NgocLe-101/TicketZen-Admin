/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table("users", function (table) {
    table.string("provider", 50);
    table.string("provider_id", 255);
  });
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table("users", function (table) {
    table.dropColumn("provider");
    table.dropColumn("provider_id");
  });
}
