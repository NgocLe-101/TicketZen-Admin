/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable("tickets", (table) => {
    table.dropColumn("user_id");
    table.integer("order_id").unsigned().notNullable();
    table.foreign("order_id").references("id").inTable("orders");
    table.decimal("price", 10, 2).notNullable().defaultTo(0);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.alterTable("tickets", (table) => {
    table.dropColumn("order_id");
    table.integer("user_id").unsigned();
    table.foreign("user_id").references("id").inTable("users");
    table.dropColumn("price");
  });
}
