import express from "express";
const router = express.Router();
import accountRouter from "../components/Account/account.router.js";
import authRouter from "../components/Auth/auth.router.js";

router.use("/auth", authRouter);
router.use(accountRouter);
router.use("/", (req, res) => {
  res.render("dashboard", {
    admin: req.user,
    activePage: "dashboard",
    message: null,
  });
});

export default router;
