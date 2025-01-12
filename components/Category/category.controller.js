import productModel from "../Product/product.model.js";

async function getAllCategories(req, res) {
  try {
    const [genres, manufacturers] = await Promise.all([
      productModel.getAllGenres(),
      productModel.getAllManufacturers(),
    ]);
    // Get the total number of products of each genre and manufacturer
    const [genreCount, manufacturerCount] = await Promise.all([
      productModel.countProductsByGenres(),
      productModel.countProductsByManufacturers(),
    ]);

    res.render("dashboard", {
      admin: req.user,
      activePage: "categories",
      message: null,
      genres: genres.map((genre) => ({
        ...genre,
        count: genreCount[genre.id] || 0,
      })),
      manufacturers: manufacturers.map((manufacturer) => ({
        ...manufacturer,
        count: manufacturerCount[manufacturer.id] || 0,
      })),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.render("dashboard", {
      admin: req.user,
      activePage: "categories",
      message: {
        type: "error",
        text: "Error fetching categories",
      },
      genres: [],
      manufacturers: [],
    });
  }
}

async function addGenre(req, res) {
  const { name } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "Name is required" });
  }

  try {
    await productModel.addGenre(name);
    res.redirect("/categories");
  } catch (error) {
    console.error("Error adding genre:", error);
    res.status(500).json({ success: false, message: "Error adding genre" });
  }
}

async function deleteGenre(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, message: "ID is required" });
  }
  try {
    await productModel.deleteGenre(id);
    res.status(200).json({ success: true, message: "Genre deleted" });
  } catch (error) {
    console.error("Error deleting genre:", error);
    res.status(500).json({ success: false, message: "Error deleting genre" });
  }
}

async function addManufacturer(req, res) {
  const { name, country, contact_info } = req.body;
  if (!name || !country) {
    return res
      .status(400)
      .json({ success: false, message: "Name and Country is required" });
  }

  try {
    await productModel.addManufacturer(name, country, contact_info);
    res.redirect("/categories");
  } catch (error) {
    console.error("Error adding genre:", error);
    res
      .status(500)
      .json({ success: false, message: "Error adding manufacturer" });
  }
}

async function deleteManufacturer(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ success: false, message: "ID is required" });
  }
  try {
    await productModel.deleteManufacturer(id);
    res.status(200).json({ success: true, message: "Manufacturer deleted" });
  } catch (error) {
    console.error("Error deleting manufacturer:", error);
    res
      .status(500)
      .json({ success: false, message: "Error deleting manufacturer" });
  }
}

async function getGenre(req, res) {
  try {
    const { id } = req.params;
    const genre = await productModel.getGenre(id);

    if (!genre) {
      return res.status(404).send("Genre not found");
    }

    res.render("Categories/edit", { type: "genre", item: genre });
  } catch (error) {
    console.error("Error fetching genre:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function updateGenre(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const genre = await productModel.updateGenre(id, name);

    if (!genre) {
      return res
        .status(404)
        .json({ success: false, message: "Genre not found" });
    }
    res.redirect("/categories");
  } catch (error) {
    console.error("Error updating genre:", error);
    res.status(500).json({ success: false, message: "Error updating genre" });
  }
}

async function getManufacturer(req, res) {
  try {
    const { id } = req.params;
    const manufacturer = await productModel.getManufacturer(id);

    if (!manufacturer) {
      return res.status(404).send("Manufacturer not found");
    }

    res.render("Categories/edit", { type: "manufacturer", item: manufacturer });
  } catch (error) {
    console.error("Error fetching manufacturer:", error);
    res.status(500).send("Internal Server Error");
  }
}

async function updateManufacturer(req, res) {
  try {
    const { id } = req.params;
    const { name, country, contact_info } = req.body;
    const manufacturer = await productModel.updateManufacturer(
      id,
      name,
      country,
      contact_info
    );

    if (!manufacturer) {
      return res
        .status(404)
        .json({ success: false, message: "Manufacturer not found" });
    }
    res.redirect("/categories");
  } catch (error) {
    console.error("Error updating manufacturer:", error);
    res
      .status(500)
      .json({ success: false, message: "Error updating manufacturer" });
  }
}

export default {
  getAllCategories,
  addGenre,
  deleteGenre,
  addManufacturer,
  deleteManufacturer,
  getGenre,
  getManufacturer,
  updateGenre,
  updateManufacturer,
};
