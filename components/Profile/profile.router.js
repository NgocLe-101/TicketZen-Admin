import express from "express";
const router = express.Router();
import profileController from "./profile.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";

router.get("/", isAuthenticated, profileController.getProfile);
router.put("/", isAuthenticated, profileController.updateProfile);

export default router;
