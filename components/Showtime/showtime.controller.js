import showtimeModel from "./showtime.model.js";
import productModel from "../Product/product.model.js";
import ValueConverter from "../../utils/Converter.js";
async function getShowTimes(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      screen = "all",
      sortBy = "created_at",
      order = "desc",
    } = req.query;

    const [showtimes, screens, movies] = await Promise.all([
      showtimeModel.getAllShowTimes({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        screen,
        sortBy,
        order,
      }),
      showtimeModel.getScreens(),
      productModel.getAllProduct({
        page: 1,
        limit: 100,
        genre: "all",
        manufacturer: "all",
        sortBy: "title",
        order: "asc",
      }),
    ]);
    console.log(showtimes);
    if (req.xhr) {
      return res.json({
        success: true,
        data: showtimes.items.map((showtime) => ({
          ...showtime,
          start_time: ValueConverter.dateTimeConverter(showtime.start_time),
          end_time: ValueConverter.dateTimeConverter(showtime.end_time),
          price: ValueConverter.currencyConverter(showtime.price),
        })),
        pagination: {
          current: parseInt(page),
          total: Math.ceil(showtimes.total / limit),
        },
      });
    }

    res.render("dashboard", {
      activePage: "showtimes",
      admin: req.user,
      message: null,
      showtimes: showtimes.items.map((showtime) => ({
        ...showtime,
        start_time: ValueConverter.dateTimeConverter(showtime.start_time),
        end_time: ValueConverter.dateTimeConverter(showtime.end_time),
        price: ValueConverter.currencyConverter(showtime.price),
      })),
      screens,
      movies: movies.items,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(showtimes.total / limit),
      },
      filters: { search, screen, sortBy, order },
    });
  } catch (error) {
    console.error("Error fetching showtimes:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching showtimes" });
  }
}

async function addShowTime(req, res) {
  try {
    const { movie_id, screen_id, start_time, end_time, price } = req.body;

    console.log(req.body);
    if (!movie_id || !screen_id || !start_time || !end_time || !price) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    await showtimeModel.addShowTime({
      movie_id,
      screen_id,
      start_time,
      end_time,
      price: parseFloat(price),
    });
    res.status(201).json({ success: true, message: "Showtime added" });
  } catch (error) {
    console.error("Error adding showtime:", error);
    res.status(500).json({ success: false, message: "Error adding showtime" });
  }
}

async function updateShowTime(req, res) {
  try {
    const { id } = req.params;
    const { movie_id, screen_id, start_time, end_time, price } = req.body;
    if (!movie_id || !screen_id || !start_time || !end_time || !price) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    await showtimeModel.updateShowTime(id, {
      movie_id,
      screen_id,
      start_time,
      end_time,
      price: parseFloat(price),
    });
    res.status(200).json({ success: true, message: "Showtime updated" });
  } catch (error) {
    console.error("Error updating showtime:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating showtime" });
  }
}

async function deleteShowTime(req, res) {
  try {
    const { id } = req.params;
    await showtimeModel.deleteShowTime(id);
    res.status(204).json({ success: true });
  } catch (error) {
    console.error("Error deleting showtime:", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting showtime" });
  }
}

async function getShowTimeDetails(req, res) {
  const { id } = req.params;
  try {
    const showtime = await showtimeModel.getShowTime(id);
    res.json({ success: true, data: showtime });
  } catch (error) {
    console.error("Error fetching showtime details:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching showtime details" });
  }
}

export default {
  getShowTimes,
  addShowTime,
  deleteShowTime,
  updateShowTime,
  getShowTimeDetails,
};
