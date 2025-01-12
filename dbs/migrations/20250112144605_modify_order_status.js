/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table("orders", (table) => {
    table.dropColumn("status");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table("orders", (table) => {
    table.enum("status", ["pending", "cancelled", "completed"]).notNullable();
  });
}
