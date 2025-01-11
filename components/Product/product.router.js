import express from "express";
const router = express.Router();
import productController from "./product.controller.js";
import upload from "../../config/mutler.config.js";

router.get("/", productController.getProducts);
router.delete("/:id", productController.deleteProduct);
router.get("/create", productController.getAddProductPage);
router.post("/create", upload.array("images", 5), productController.addProduct);
router.get("/:id", productController.getProductDetails);
router.post(
  "/:id",
  upload.array("newImages", 5),
  productController.updateProduct
);
router.post("/remove-image", productController.removeImage);
export default router;
