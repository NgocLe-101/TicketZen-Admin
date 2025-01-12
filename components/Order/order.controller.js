import OrderModel from "./order.model.js";
import ValueConverter from "../../utils/Converter.js";
async function getAllOrders(req, res) {
  const {
    limit = 10,
    page = 1,
    status = "all",
    sortBy = "created_at",
    order = "desc",
  } = req.query;
  try {
    // Will implement this later
    const orders = await OrderModel.getAllOrders({
      limit: parseInt(limit),
      page: parseInt(page),
      status,
      sortBy,
      order,
    });
    const ordersData = orders.items.map((order) => {
      return {
        ...order,
        created_at: ValueConverter.dateTimeConverter(order.created_at),
        total_amount: ValueConverter.currencyConverter(order.total_amount),
      };
    });
    console.log(ordersData);
    if (req.xhr) {
      return res.json({ success: true, data: ordersData });
    }
    res.render("dashboard", {
      activePage: "orders",
      admin: req.user,
      message: null,
      orders: ordersData,
      pagination: {
        current: page,
        total: Math.ceil(orders.total / limit),
      },
      filters: { status, sortBy, order },
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
}

async function getOrderDetails(req, res) {
  const { id } = req.params;
  try {
    const result = await OrderModel.getOrderDetails(id);
    if (!result.order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }
    if (req.xhr) {
      return res.json({ success: true, data: result });
    }
    res.render("orders/details", {
      order: {
        ...result.order,
        created_at: ValueConverter.dateTimeConverter(result.order.created_at),
        total_amount: ValueConverter.currencyConverter(
          result.order.total_amount
        ),
      },
      tickets: result.tickets.map((ticket) => ({
        ...ticket,
        price: ValueConverter.currencyConverter(ticket.price),
      })),
    });
  } catch (err) {
    console.error("Error fetching order details:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error fetching order details" });
  }
}

export default {
  getAllOrders,
  getOrderDetails,
};
