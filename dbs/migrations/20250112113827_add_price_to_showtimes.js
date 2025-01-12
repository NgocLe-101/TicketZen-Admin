/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table("showtimes", (table) => {
    table.decimal("price", 10, 2).notNullable().defaultTo(0);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table("showtimes", (table) => {
    table.dropColumn("price");
  });
}
