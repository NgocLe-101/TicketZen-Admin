import express from "express";
const router = express.Router();
import accountRouter from "../components/Account/account.router.js";
import authRouter from "../components/Auth/auth.router.js";
import profileRouter from "../components/Profile/profile.router.js";
import productRouter from "../components/Product/product.router.js";
import categoryRouter from "../components/Category/category.router.js";
import showtimeRouter from "../components/Showtime/showtime.router.js";
import orderRouter from "../components/Order/order.router.js";
import reportRouter from "../components/Report/report.router.js";

router.use("/auth", authRouter);
router.use(accountRouter);
router.use("/profile", profileRouter);
router.use("/products", productRouter);
router.use("/categories", categoryRouter);
router.use("/showtimes", showtimeRouter);
router.use("/orders", orderRouter);
router.use("/reports", reportRouter);
router.use("/", (req, res) => {
  res.render("dashboard", {
    admin: req.user,
    activePage: "404",
    message: {
      type: "error",
      text: "Page not found",
    },
  });
});

export default router;
