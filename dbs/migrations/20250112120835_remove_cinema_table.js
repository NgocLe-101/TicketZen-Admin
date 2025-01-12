/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .alterTable("screens", (table) => {
      table.dropColumn("cinema_id");
    })
    .dropTable("cinemas");
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema
    .createTable("cinemas", (table) => {
      table.increments("cinema_id").primary();
      table.string("name").notNullable();
      table.string("address").notNullable();
      table.timestamp(true, true);
    })
    .table("screens", (table) => {
      table.integer("cinema_id").unsigned().notNullable();
      table.foreign("cinema_id").references("cinema_id").inTable("cinemas");
    });
}
