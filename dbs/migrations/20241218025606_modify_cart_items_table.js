/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.alterTable("cart_items", (table) => {
    table.dropColumn("user_id");
    table
      .integer("cart_id")
      .references("id")
      .inTable("carts")
      .onDelete("CASCADE");
    table.decimal("price", 14, 2).notNullable().defaultTo(0);
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.alterTable("cart_items", (table) => {
    table
      .integer("user_id")
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.dropColumn("cart_id");
    table.dropColumn("price");
  });
}
