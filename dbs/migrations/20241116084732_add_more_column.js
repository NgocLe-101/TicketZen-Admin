const { table } = require("../dbs/db");

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
      .createTable("genres", (table) => {
        table.increments("id");
        table.string("name");
        table.timestamps(true, true);
      })
      .createTable("languages", (table) => {
        table.increments("id");
        table.string("name");
        table.timestamps(true, true);
      })
      .createTable("age_ratings", (table) => {
        table.increments("id");
        table.string("name");
        table.timestamps(true, true);
      })
      .createTable("cinemas", (table) => {
        table.increments("id");
        table.string("name");
        table.string("address");
        table.timestamps(true, true);
      })
      .createTable("screens", (table) => {
        table.increments("id");
        table.integer("cinema_id").unsigned().references("id").inTable("cinemas");
        table.string("name");
        table.integer("seats"); // Total seats available in the screen
        table.timestamps(true, true);
      })
      .createTable("showtimes", (table) => {
        table.increments("id");
        table.integer("movie_id").unsigned().references("id").inTable("products");
        table.integer("screen_id").unsigned().references("id").inTable("screens");
        table.datetime("start_time");
        table.datetime("end_time");
        table.timestamps(true, true);
      })
      .createTable("seat_types", (table) => {
        table.increments("id");
        table.string("name");
        table.timestamps(true, true);
      })
      .createTable("seats", (table) => {
        table.increments("id");
        table.integer("screen_id").unsigned().references("id").inTable("screens");
        table.integer("seat_number");
        table.boolean("is_booked").defaultTo(false);
        table
            .integer("seat_type")
            .unsigned()
            .references("id")
            .inTable("seat_types");
        table.timestamps(true, true);
      })
      .createTable("promotions", (table) => {
        table.increments("id");
        table.string("title");
        table.string("description");
        table.string("image");
        table.timestamps(true, true);
      })
      .createTable("bookings", (table) => {
        table.increments("id");
        table.integer("user_id").unsigned().references("id").inTable("users");
        table
            .integer("showtime_id")
            .unsigned()
            .references("id")
            .inTable("showtimes");
        table.integer("seat_id").unsigned().references("id").inTable("seats");
        table.integer("total_price");
        table.timestamps(true, true);
      })
      .alterTable("products", (table) => {
        table.integer("genre").unsigned().references("id").inTable("genres");
        table
            .integer("language")
            .unsigned()
            .references("id")
            .inTable("languages");
        table
            .integer("age_rating")
            .unsigned()
            .references("id")
            .inTable("age_ratings");
        table.dateTime("release_date");
        table.integer("duration");
        table.string("poster");
        table.string("trailer");
        table.float("rating");
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
      .dropTable("genres")
      .dropTable("languages")
      .dropTable("age_ratings")
      .dropTable("cinemas")
      .dropTable("screens")
      .dropTable("showtimes")
      .dropTable("seat_types")
      .dropTable("seats")
      .dropTable("promotions")
      .dropTable("bookings")
      .alterTable("products", (table) => {
        table.dropColumn("genre");
        table.dropColumn("language");
        table.dropColumn("age_rating");
        table.dropColumn("release_date");
        table.dropColumn("poster");
        table.dropColumn("trailer");
      });
};