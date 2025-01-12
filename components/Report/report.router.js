import express from "express";
const router = express.Router();
import reportController from "./report.controller.js";

router.get("/", reportController.getRevenueReport);
// router.get("/movie-revenue", reportController.getMovieRevenue);

export default router;
