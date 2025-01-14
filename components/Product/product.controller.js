import productModel from "./product.model.js";
import fs from "fs";
import cloudinary from "../../config/cloudinary.config.js";
import ValueConverter from "../../utils/Converter.js";
async function getProducts(req, res) {
  try {
    const {
      page = 1,
      limit = 5,
      search = "",
      genre = "all", // 'all' for no filter
      manufacturer = "all", // 'all' for no filter
      sortBy = "created_at", // Default sorting by creation time
      order = "desc", // Default order
    } = req.query;

    const [products, genres, manufacturers] = await Promise.all([
      productModel.getAllProduct({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        genre,
        manufacturer,
        sortBy,
        order,
      }),
      productModel.getAllGenres(),
      productModel.getAllManufacturers(),
    ]);
    const productData = products.items.map((product) => {
      return {
        ...product,
        price: ValueConverter.currencyConverter(product.price),
      };
    });
    const productTotal = products.total;
    if (req.xhr) {
      // Respond with JSON for AJAX requests
      return res.json({
        success: true,
        data: productData,
        pagination: {
          current: page,
          total: Math.ceil(productTotal / limit),
        },
      });
    }
    console.log(productData.map((product) => product.images));
    // Render EJS page for non-AJAX requests
    res.render("dashboard", {
      activePage: "products",
      admin: req.user,
      message: null,
      products: productData,
      genres,
      manufacturers,
      pagination: {
        current: page,
        total: Math.ceil(productTotal / limit),
      },
      filters: { search, genre, manufacturer, sortBy, order },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching products" });
  }
}

async function getAddProductPage(req, res) {
  const [genres, manufacturers, languages, age_ratings] = await Promise.all([
    productModel.getAllGenres(),
    productModel.getAllManufacturers(),
    productModel.getAllLanguages(),
    productModel.getAllAgeRatings(),
  ]);
  res.render("products/add", { genres, manufacturers, languages, age_ratings });
}

async function addProduct(req, res) {
  try {
    const {
      title,
      genre,
      manufacturer,
      price,
      description,
      status,
      language,
      age_rating,
      release_date,
      trailer,
      rating,
      duration,
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !genre ||
      !manufacturer ||
      !price ||
      !description ||
      !status ||
      !language ||
      !age_rating ||
      !release_date ||
      !trailer ||
      !rating ||
      !duration
    ) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate images
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "At least one image is required" });
    }

    const images = req.files.map((file) => file.path);
    const product = {
      title,
      category: genre,
      manufacturer,
      price,
      description,
      status,
      images,
      language,
      age_rating,
      release_date,
      trailer,
      rating,
      duration,
    };
    const newProduct = await productModel.addProduct(product);

    // clear images from disk
    req.files.forEach((file) => {
      fs.unlinkSync(file.path);
    });

    res.redirect("/products");
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ success: false, message: "Error adding product" });
  }
}

async function getProductDetails(req, res) {
  try {
    const { id } = req.params;
    const product = await productModel.getProductById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    console.log(product);
    const [genres, manufacturers, languages, age_ratings] = await Promise.all([
      productModel.getAllGenres(),
      productModel.getAllManufacturers(),
      productModel.getAllLanguages(),
      productModel.getAllAgeRatings(),
    ]);
    res.render("products/edit", {
      product,
      genres,
      manufacturers,
      languages,
      age_ratings,
    });
  } catch (error) {
    console.error("Error fetching product details:", error);
    res
      .status(500)
      .json({ success: false, message: "Error fetching product details" });
  }
}

async function removeImage(req, res) {
  try {
    const { id } = req.params;
    const { photoId } = req.body;
    console.log(photoId);
    const image = await productModel.removeImage(id, photoId);
    if (!image) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }
    // Remove image from cloudinary
    if (image.public_id) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    res
      .status(200)
      .json({ success: true, message: "Image removed successfully" });
  } catch (error) {
    console.error("Error removing image:", error);
    res.status(500).json({ success: false, message: "Error removing image" });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const product = await productModel.deleteProduct(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res
      .status(204)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ success: false, message: "Error deleting product" });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      genre,
      manufacturer,
      price,
      description,
      status,
      language,
      age_rating,
      release_date,
      trailer,
      rating,
      duration,
    } = req.body;
    const product = {
      id,
      title,
      category: genre,
      manufacturer,
      price,
      description,
      status,
      language,
      age_rating,
      release_date,
      trailer,
      rating,
      duration,
    };

    if (req.files && req.files.length > 0) {
      const images = req.files.map((file) => file.path);
      product.images = images;
    }

    const updatedProduct = await productModel.updateProduct(product);
    res.redirect("/products");
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ success: false, message: "Error updating product" });
  }
}

export default {
  getProducts,
  getAddProductPage,
  addProduct,
  getProductDetails,
  removeImage,
  deleteProduct,
  updateProduct,
};
