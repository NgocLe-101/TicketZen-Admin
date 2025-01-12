import db from "../../dbs/init.db.js";

class ReportModel {
  async getRevenueByTimeRange(start_date, end_date) {
    try {
      const revenue = await db("orders")
        .whereBetween("created_at", [start_date, end_date])
        .where("status", "paid")
        .sum("total_amount as total")
        .first();

      const dailyRevenue = await db("orders")
        .whereBetween("created_at", [start_date, end_date])
        .where("status", "paid")
        .select(db.raw("DATE(created_at) as date"))
        .sum("total_amount as daily_total")
        .groupBy("date")
        .orderBy("date");

      return {
        totalRevenue: revenue.total || 0,
        dailyRevenue,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getTopMoviesByRevenue(start_date, end_date, limit = 10) {
    try {
      const topMovies = await db("orders")
        .join("tickets", "orders.id", "tickets.order_id")
        .join("showtimes", "tickets.showtime_id", "showtimes.id")
        .join("products", "showtimes.movie_id", "products.id")
        .whereBetween("orders.created_at", [start_date, end_date])
        .where("orders.status", "paid")
        .select("products.id", "products.title")
        .sum("tickets.price as revenue")
        .count("tickets.id as ticket_count")
        .groupBy("products.id", "products.title")
        .orderBy("revenue", "desc")
        .limit(limit);
      const productImages = await Promise.all(
        topMovies.map(async (movie) => {
          const images = await db("product_images")
            .where("product_id", movie.id)
            .select("image_url");
          return images;
        })
      );
      topMovies.forEach((movie, index) => {
        movie.images = productImages[index];
      });
      console.log(topMovies);
      return topMovies;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new ReportModel();
