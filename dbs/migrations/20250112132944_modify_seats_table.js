/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function up(knex) {
  return knex.schema.table("seats", (table) => {
    table.dropColumn("is_booked");
    table.dropColumn("seat_number");
    table
      .enum("status", ["occupied", "available", "booked"])
      .defaultTo("available");
    table.string("name");
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export function down(knex) {
  return knex.schema.table("seats", (table) => {
    table.dropColumn("status");
    table.dropColumn("name");
    table.boolean("is_booked").defaultTo(false);
    table.integer("seat_number").notNullable();
  });
}
