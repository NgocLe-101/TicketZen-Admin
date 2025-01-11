/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema
    .createTable("manufacturers", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("country").notNullable();
      table.string("contact_info");
    })
    .alterTable("products", (table) => {
      table.integer("manufacturer").unsigned();
      table.foreign("manufacturer").references("id").inTable("manufacturers");
    });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema
    .dropTable("manufacturers")
    .alterTable("products", (table) => {
      table.dropColumn("manufacturer");
    });
}
