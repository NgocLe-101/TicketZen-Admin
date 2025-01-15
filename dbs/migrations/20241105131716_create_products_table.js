export function up(knex) {
  return knex.schema.createTable("products", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.text("description");
    table.float("price");
    table.string("image_url");
    table.timestamps(true, true);
  });
}

export function down(knex) {
  return knex.schema.dropTableIfExists("products");
}
