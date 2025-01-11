import express from "express";
import { isAdmin, isAuthenticated } from "../middlewares/auth.middleware.js";
import accountController from "./account.controller.js";
const router = express.Router();

router.get(
  "/accounts",
  isAuthenticated,
  isAdmin,
  accountController.getAllAccount
);
router.get(
  "/accounts/:id",
  isAuthenticated,
  isAdmin,
  accountController.getAccountDetails
);
router.put(
  "/accounts/:id/status",
  isAuthenticated,
  isAdmin,
  accountController.updateAccountStatus
);
router.post(
  "/accounts/:id/ban",
  isAuthenticated,
  isAdmin,
  accountController.banAccount
);

export default router;
