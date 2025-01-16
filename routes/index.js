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
import { isAuthenticated } from "../components/middlewares/auth.middleware.js";

router.use("/auth", authRouter);
router
  .use(isAuthenticated)
  .use(accountRouter)
  .use("/profile", profileRouter)
  .use("/products", productRouter)
  .use("/categories", categoryRouter)
  .use("/showtimes", showtimeRouter)
  .use("/orders", orderRouter)
  .use("/reports", reportRouter);
// router.use(accountRouter);
// router.use("/profile", profileRouter);
// router.use("/products", productRouter);
// router.use("/categories", categoryRouter);
// router.use("/showtimes", showtimeRouter);
// router.use("/orders", orderRouter);
// router.use("/reports", reportRouter);
router.use("/", (req, res) => {
  if (req.user) {
    res.render("dashboard", {
      activePage: "dashboard",
      admin: req.user,
      message: null,
    });
  } else {
    res.redirect("/auth/login");
  }
});

export default router;
