import express from "express";
const router = express.Router();
import profileController from "./profile.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import upload from "../../config/mutler.config.js";

router.get("/", isAuthenticated, profileController.getProfile);
router.patch(
  "/",
  isAuthenticated,
  upload.single("avatar"),
  profileController.updateProfile
);

export default router;
