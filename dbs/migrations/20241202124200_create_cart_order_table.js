/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("cart_items", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned();
      table.integer("movie_id").unsigned();
      table.integer("quantity").unsigned().defaultTo(1);
      table.timestamps(true, true);
      table.foreign("user_id").references("users.id").onDelete("CASCADE");
      table.foreign("movie_id").references("products.id").onDelete("CASCADE");
    })
    .createTable("orders", (table) => {
      table.increments("id").primary();
      table.integer("user_id").unsigned();
      table.integer("total_amount").unsigned();
      table.enum("status", ["pending", "completed", "cancelled"]);
      table.timestamps(true, true);
      table.foreign("user_id").references("users.id").onDelete("CASCADE");
    })
    .createTable("order_items", (table) => {
      table.increments("id").primary();
      table.integer("order_id").unsigned();
      table.integer("movie_id").unsigned();
      table.integer("quantity").unsigned().defaultTo(1);
      table.decimal("price", 10, 2);
      table.foreign("order_id").references("orders.id").onDelete("CASCADE");
      table.foreign("movie_id").references("products.id").onDelete("CASCADE");
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTable("order_items")
    .dropTable("orders")
    .dropTable("cart_items");
};
