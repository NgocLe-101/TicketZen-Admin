import db from "../../dbs/init.db.js";

class OrderModel {
  async getAllOrders({ limit, page, status, sortBy, order }) {
    try {
      const total = await db("orders")
        .modify((queryBuilder) => {
          if (status !== "all") {
            queryBuilder.where("status", status);
          }
        })
        .count("* as count")
        .first();
      let query = db("orders")
        .leftJoin("users", "orders.user_id", "users.id")
        .leftJoin("tickets", "orders.id", "tickets.order_id")
        .leftJoin("showtimes", "tickets.showtime_id", "showtimes.id")
        .leftJoin("products", "showtimes.movie_id", "products.id")
        .select("orders.*", "users.username", "products.title as movie_title")
        .groupBy("orders.id", "users.username", "products.title")
        .modify((queryBuilder) => {
          if (status !== "all") {
            queryBuilder.where("status", status);
          }
        });

      const orders = await query
        .orderBy(sortBy, order)
        .limit(limit)
        .offset((page - 1) * limit);

      return { items: orders, total: parseInt(total.count) };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getOrderDetails(id) {
    try {
      const orderInfo = await db("orders")
        .join("users", "orders.user_id", "users.id")
        .where("orders.id", id)
        .select("orders.*", "users.username", "users.email", "users.avatar")
        .first();
      const tickets = await db("tickets")
        .join("showtimes", "tickets.showtime_id", "showtimes.id")
        .join("products", "showtimes.movie_id", "products.id")
        .join("seats", "tickets.seat_id", "seats.id")
        .where("tickets.order_id", id)
        .select(
          "products.id as product_id",
          "products.title as movie_title",
          "products.description",
          "seats.name as seat_name",
          "tickets.price"
        );
      const updatedTickets = await Promise.all(
        tickets.map(async (ticket) => {
          const images = await db("product_images")
            .where("product_id", ticket.product_id)
            .select("image_url");
          return { ...ticket, movie_images: images };
        })
      );
      return {
        order: orderInfo,
        tickets: updatedTickets,
      };
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async updateOrderStatus(id, status) {
    try {
      await db("orders").where("id", id).update({ status });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new OrderModel();
