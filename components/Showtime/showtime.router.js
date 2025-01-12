import express from "express";
const router = express.Router();
import showtimeController from "./showtime.controller.js";

router.get("/", showtimeController.getShowTimes);
router.post("/", showtimeController.addShowTime);
router.delete("/:id", showtimeController.deleteShowTime);
router.put("/:id", showtimeController.updateShowTime);
router.get("/:id", showtimeController.getShowTimeDetails);

export default router;
