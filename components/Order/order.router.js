import express from "express";
const router = express.Router();

import orderController from "./order.controller.js";

router.get("/", orderController.getAllOrders);
router.get("/:id", orderController.getOrderDetails);
router.patch("/:id", orderController.updateOrderStatus);
// router.post("/", orderController.createOrder);
// router.put("/:id", orderController.updateOrder);
// router.delete("/:id", orderController.deleteOrder);

export default router;
