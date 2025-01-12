import ReportModel from "./report.model.js";
import ValueConverter from "../../utils/Converter.js";

class ReportController {
  async getRevenueReport(req, res) {
    try {
      const { range = "week" } = req.query;
      const end_date = new Date();
      let start_date;

      switch (range) {
        case "day":
          start_date = new Date(end_date);
          start_date.setDate(end_date.getDate() - 1);
          break;
        case "week":
          start_date = new Date(end_date);
          start_date.setDate(end_date.getDate() - 7);
          break;
        case "month":
          start_date = new Date(end_date);
          start_date.setMonth(end_date.getMonth() - 1);
          break;
        case "year":
          start_date = new Date(end_date);
          start_date.setFullYear(end_date.getFullYear() - 1);
          break;
        default:
          start_date = new Date(end_date);
          start_date.setDate(end_date.getDate() - 7);
      }

      const [revenue, topMovies] = await Promise.all([
        ReportModel.getRevenueByTimeRange(start_date, end_date),
        ReportModel.getTopMoviesByRevenue(start_date, end_date, 5),
      ]);

      if (req.xhr) {
        return res.json({ success: true, data: { revenue, topMovies } });
      }

      res.render("dashboard", {
        admin: req.user,
        activePage: "reports",
        message: null,
        revenue: {
          ...revenue,
          totalRevenue: ValueConverter.currencyConverter(revenue.totalRevenue),
        },
        topMovies: topMovies.map((movie) => ({
          ...movie,
          revenue: ValueConverter.currencyConverter(movie.revenue),
        })),
        range,
      });
    } catch (error) {
      console.error("Error generating report:", error);
      res
        .status(500)
        .json({ success: false, message: "Error generating report" });
    }
  }
}

export default new ReportController();
