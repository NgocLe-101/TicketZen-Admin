/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("carts", (table) => {
    table.increments("id").primary();
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.string("session_id").unique();
    table.timestamps(true, true);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("carts");
}
