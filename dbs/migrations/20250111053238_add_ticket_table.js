/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  // Create showtimes table which will store the showtimes for the movies
  return knex.schema.createTable("tickets", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().notNullable();
    table.foreign("user_id").references("id").inTable("users");
    table.integer("showtime_id").unsigned().notNullable();
    table.foreign("showtime_id").references("id").inTable("showtimes");
    table.integer("seat_id").unsigned().notNullable();
    table.foreign("seat_id").references("id").inTable("seats");
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.dropTable("tickets");
}
