import express from "express";
const router = express.Router();
import authController from "./auth.controller.js";

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.post("/logout", authController.postLogout);

export default router;
