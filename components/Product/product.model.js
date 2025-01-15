import db from "../../dbs/init.db.js";
import path from "path";
import cloudinary from "../../config/cloudinary.config.js";
import sharp from "sharp";

class ProductModel {
  async getAllProduct({
    page,
    limit,
    search,
    genre,
    manufacturer,
    sortBy,
    order,
  }) {
    try {
      const total = await db("products").count("* as count").first();
      let query = db("products")
        .leftJoin("manufacturers", "products.manufacturer", "manufacturers.id")
        .join("genres", "products.genre", "genres.id")
        .select(
          "products.*",
          "manufacturers.name as manufacturer",
          "genres.name as genre"
        )
        .modify((queryBuilder) => {
          if (search) {
            queryBuilder.where("title", "ilike", `%${search}%`);
          }
          if (genre !== "all") {
            queryBuilder.where("genre", genre);
          }
          if (manufacturer !== "all") {
            queryBuilder.where("manufacturer", manufacturer);
          }
        });

      const products = await query
        .orderBy(sortBy, order)
        .limit(limit)
        .offset((page - 1) * limit);

      const productImages = await db("product_images").select("*");
      products.forEach((product) => {
        product.images = productImages
          .filter((image) => image.product_id === product.id)
          .map((image) => ({
            image_url: image.image_url,
            public_id: image.public_id,
          }));
      });

      return { items: products, total: parseInt(total.count) };
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getAllGenres() {
    try {
      const genres = await db("genres").select("*");
      return genres;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getAllManufacturers() {
    try {
      const manufacturers = await db("manufacturers").select("*");
      return manufacturers;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getAllLanguages() {
    try {
      const languages = await db("languages").select("*");
      return languages;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getAllAgeRatings() {
    try {
      const ageRatings = await db("age_ratings").select("*");
      return ageRatings;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async addProduct({
    title,
    category,
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
  }) {
    try {
      const [product] = await db("products")
        .insert({
          title,
          genre: category,
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
        })
        .returning("*");
      if (images && images.length) {
        const imageRecords = await Promise.all(
          images.map(async (image) => {
            const result = await cloudinary.uploader.upload(image, {
              folder: "WAD/product_images",
            });
            return {
              product_id: product.id,
              image_url: result.secure_url,
              public_id: result.public_id,
            };
          })
        );
        await db("product_images").insert(imageRecords);
        await db("products").where("id", product.id).update({
          poster: imageRecords[0].image_url,
        });
      }
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getProductById(id) {
    try {
      const product = await db("products")
        .leftJoin("manufacturers", "products.manufacturer", "manufacturers.id")
        .join("genres", "products.genre", "genres.id")
        .select(
          "products.*",
          "manufacturers.name as manufacturer",
          "genres.name as genre"
        )
        .where("products.id", id)
        .first();

      if (!product) {
        return null;
      }
      const productImages = await db("product_images")
        .where("product_id", id)
        .select("*");
      product.images = productImages.map((image) => {
        return {
          image_url: image.image_url,
          public_id: image.public_id,
        };
      });
      return product;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async removeImage(productId, photoId) {
    try {
      const image = await db("product_images")
        .where("product_id", productId)
        .andWhere("public_id", photoId)
        .first();
      if (!image) {
        return null;
      }
      await db("product_images").where("public_id", photoId).del();
      return image;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async deleteProduct(id) {
    try {
      await db("products").where("id", id).del();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async updateProduct({
    id,
    title,
    category,
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
  }) {
    try {
      // patch the product
      await db("products").where("id", id).update({
        title,
        genre: category,
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
      });

      if (images && images.length) {
        const imageRecords = await Promise.all(
          images.map(async (image) => {
            // compress the image to reduce the size here
            const fullPath = path.resolve(image);

            const compressedImagePath = `${fullPath}-compressed.jpeg`;
            await sharp(fullPath)
              .resize({ width: 800 }) // Resize ảnh
              .toFormat("jpeg") // Chuyển đổi sang định dạng JPEG
              .jpeg({ quality: 80 }) // Nén ảnh
              .toFile(compressedImagePath); // Lưu ảnh đã nén vào file tạm
            const result = await cloudinary.uploader.upload(
              compressedImagePath,
              {
                folder: "WAD/product_images",
              }
            );
            fs.unlinkSync(compressedImagePath);

            return {
              product_id: id,
              image_url: result.secure_url,
              public_id: result.public_id,
            };
          })
        );
        await db("product_images").insert(imageRecords);
      }
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async countProductsByGenres() {
    try {
      const counts = await db("products")
        .select("genre")
        .count("* as count")
        .groupBy("genre");
      return counts.reduce((acc, { genre, count }) => {
        acc[genre] = count;
        return acc;
      }, {});
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async countProductsByManufacturers() {
    try {
      const counts = await db("products")
        .select("manufacturer")
        .count("* as count")
        .groupBy("manufacturer");
      return counts.reduce((acc, { manufacturer, count }) => {
        acc[manufacturer] = count;
        return acc;
      }, {});
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async getGenre(id) {
    try {
      const genre = await db("genres").where("id", id).first();
      return genre;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async addGenre(name) {
    try {
      const [genre] = await db("genres").insert({ name }).returning("*");
      return genre;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async deleteGenre(id) {
    try {
      await db("genres").where("id", id).del();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async updateGenre(id, name) {
    try {
      await db("genres").where("id", id).update({ name });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async getManufacturer(id) {
    try {
      const manufacturer = await db("manufacturers").where("id", id).first();
      return manufacturer;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async addManufacturer(name, country, contact_info = null) {
    console.log(name, country, contact_info);
    try {
      const [manufacturer] = await db("manufacturers")
        .insert({ name, country, contact_info })
        .returning("*");
      return manufacturer;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async deleteManufacturer(id) {
    try {
      await db("manufacturers").where("id", id).del();
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async updateManufacturer(id, name, country, contact_info) {
    try {
      await db("manufacturers")
        .where("id", id)
        .update({ name, country, contact_info });
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new ProductModel();
