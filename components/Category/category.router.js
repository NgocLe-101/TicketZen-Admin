import express from "express";
const router = express.Router();
import categoryController from "./category.controller.js";

router.get("/", categoryController.getAllCategories);
router.get("/genres/:id", categoryController.getGenre);
router.post("/genres/:id", categoryController.updateGenre);
router.post("/genres", categoryController.addGenre);
router.delete("/genres/:id", categoryController.deleteGenre);
router.get("/manufacturers/:id", categoryController.getManufacturer);
router.post("/manufacturers/:id", categoryController.updateManufacturer);
router.post("/manufacturers", categoryController.addManufacturer);
router.delete("/manufacturers/:id", categoryController.deleteManufacturer);
export default router;
