import db from "../../dbs/init.db.js";

class ShowTimeModel {
  async getAllShowTimes({
    page = 1,
    limit = 10,
    search = "",
    screen = "all",
    sortBy = "created_at",
    order = "desc",
  }) {
    try {
      const total = await db("showtimes")
        .join("products", "showtimes.movie_id", "products.id")
        .modify((queryBuilder) => {
          if (search) {
            queryBuilder.where("products.title", "ilike", `%${search}%`);
          }
          if (screen !== "all") {
            queryBuilder.where("screen_id", screen);
          }
        })
        .count("* as count")
        .first();

      let query = db("showtimes")
        .join("products", "showtimes.movie_id", "products.id")
        .join("screens", "showtimes.screen_id", "screens.id")
        .select(
          "showtimes.*",
          "products.title as movie_title",
          "screens.name as screen_name"
        )
        .modify((queryBuilder) => {
          if (search) {
            queryBuilder.where("products.title", "ilike", `%${search}%`);
          }
          if (screen !== "all") {
            queryBuilder.where("screen_id", screen);
          }
        });

      const showtimes = await query
        .orderBy(sortBy, order)
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        items: showtimes,
        total: parseInt(total.count),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getScreens() {
    try {
      return await db("screens").select("*");
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async addShowTime({ movie_id, screen_id, start_time, end_time, price }) {
    try {
      const [showtime] = await db("showtimes")
        .insert({
          movie_id,
          screen_id,
          start_time,
          end_time,
          price,
        })
        .returning("*");
      return showtime;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async updateShowTime(
    id,
    { movie_id, screen_id, start_time, end_time, price }
  ) {
    try {
      await db("showtimes").where("id", id).update({
        movie_id,
        screen_id,
        start_time,
        end_time,
        price,
      });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteShowTime(id) {
    try {
      await db("showtimes").where("id", id).del();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getShowTime(id) {
    try {
      let query = db("showtimes")
        .join("products", "showtimes.movie_id", "products.id")
        .join("screens", "showtimes.screen_id", "screens.id")
        .select(
          "showtimes.*",
          "products.title as movie_title",
          "screens.name as screen_name"
        )
        .where("showtimes.id", id)
        .first();
      return await query;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new ShowTimeModel();
