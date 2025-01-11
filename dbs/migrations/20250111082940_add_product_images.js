/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.createTable("product_images", (table) => {
    table.increments("id").primary();
    table.integer("product_id").unsigned().notNullable();
    table.foreign("product_id").references("products.id").onDelete("CASCADE");
    table.string("image_url").notNullable();
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("product_images");
}
