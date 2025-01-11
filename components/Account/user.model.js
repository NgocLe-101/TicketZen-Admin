import db from "../../dbs/init.db.js";
import bcrypt from "bcrypt";
import { performance } from "perf_hooks";

const UserModel = {
  createUser: async ({ username, email, password }) => {
    console.log("Creating user");
    const startTimer = performance.now();
    const trx = await db.transaction();
    try {
      const [hashedPassword, verification_token] = await Promise.all([
        bcrypt.hash(password, 10),
        bcrypt.hash(email, 10),
      ]);
      const endTimer = performance.now();
      console.log(`Hashing took ${(endTimer - startTimer).toFixed(2)} ms`);
      const userInsertStart = performance.now();
      const [data] = await trx("users")
        .insert({
          username,
          email,
          password: hashedPassword,
        })
        .returning("id");
      const userInsertEnd = performance.now();
      console.log(
        `User insert took ${(userInsertEnd - userInsertStart).toFixed(2)} ms`
      );
      const tokenInsertStart = performance.now();
      await trx("verification_tokens").insert({
        user_id: data.id,
        token: verification_token,
        expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      });
      const tokenInsertEnd = performance.now();
      console.log(
        `Token insert took ${(tokenInsertEnd - tokenInsertStart).toFixed(2)} ms`
      );

      await trx.commit();
      return { id: data.id, username, email, verification_token };
    } catch (error) {
      await trx.rollback();
      throw new Error(error.message);
    }
  },
  findOne: async (condition) => {
    try {
      return await db("users").where(condition).first();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  findOneWithUsernameOrEmail: async (username, email) => {
    try {
      return await db("users")
        .where("username", username)
        .orWhere("email", email)
        .first();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  findUserById: async (id) => {
    try {
      const result = await db.raw(
        `
        SELECT id, username, email, state, role, avatar, created_at, updated_at, status
        FROM users
        WHERE id = ${id}
        `
      );
      const user = result.rows[0];
      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getUser: async (id) => {
    try {
      const result = await db.raw(`SELECT * FROM users WHERE id = ?`, [id]); // Use parameterized query
      const user = result.rows[0]; // Assuming the result is an array with rows
      return user; // This returns the resolved user object
    } catch (error) {
      throw new Error(error.message);
    }
  },

  verifyUser: async (token) => {
    try {
      const user = await db("users")
        .join("verification_tokens", "users.id", "verification_tokens.user_id")
        .where("verification_tokens.token", token)
        .first();

      if (!user) {
        throw new Error("Invalid token");
      }

      const isExpired = new Date() > new Date(user.expires);
      if (isExpired) {
        throw new Error("Token expired");
      }

      await Promise.all([
        db("verification_tokens").where("user_id", user.user_id).del(),
        db("users").where("id", user.user_id).update({ state: "verified" }),
      ]);

      return user;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserByEmail: async (email) => {
    try {
      return await db("users").where({ email }).first();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  saveVerificationCode: async (userId, verificationCode) => {
    try {
      await db("verification_codes").insert({
        user_id: userId,
        verification_code: verificationCode,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      });
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getVerificationCode: async (userId) => {
    try {
      return await db("verification_codes")
        .where({ user_id: userId })
        .where("expires", ">", new Date())
        .first();
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updatePassword: async (userId, newPassword) => {
    const trx = await db.transaction();
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      // Update new password
      await trx("users").where({ id: userId }).update({
        password: hashedPassword,
      });

      // Delete verification code
      await trx("verification_codes").where({ user_id: userId }).del();

      await trx.commit();
    } catch (error) {
      await trx.rollback();
      throw new Error(error.message);
    }
  },

  createUserByProvide: async ({ provide, provide_id, email, username }) => {
    console.log(`Creating user via ${provide}`);
    const startTimer = performance.now();
    const trx = await db.transaction();

    try {
      // Hash email for verification token
      const [verification_token] = await Promise.all([bcrypt.hash(email, 10)]);
      const endTimer = performance.now();
      console.log(`Hashing took ${(endTimer - startTimer).toFixed(2)} ms`);

      // Insert user into 'users' table
      const userInsertStart = performance.now();
      const [data] = await trx("users")
        .insert({
          provider: provide,
          provider_id: provide_id,
          email,
          username,
          password: null, // No password needed for social login
        })
        .returning("id");
      const userInsertEnd = performance.now();
      console.log(
        `User insert took ${(userInsertEnd - userInsertStart).toFixed(2)} ms`
      );

      // Insert verification token into 'verification_tokens' table
      const tokenInsertStart = performance.now();
      await trx("verification_tokens").insert({
        user_id: data.id,
        token: verification_token,
        expires: new Date(Date.now() + 30 * 60 * 1000), // Token expires in 30 minutes
      });
      const tokenInsertEnd = performance.now();
      console.log(
        `Token insert took ${(tokenInsertEnd - tokenInsertStart).toFixed(2)} ms`
      );

      // Commit transaction
      await trx.commit();

      return {
        id: data.id,
        username,
        email,
        verification_token,
      };
    } catch (error) {
      await trx.rollback();
      throw new Error(error.message);
    }
  },
  getAllUser: async ({ page, limit, search, type, sortBy, order }) => {
    try {
      const total = await db("users").count("* as count").first();
      let query = db("users")
        .select("users.*")
        .modify(function (queryBuilder) {
          if (search) {
            queryBuilder.where(function () {
              this.where("username", "ilike", `%${search}%`).orWhere(
                "email",
                "ilike",
                `%${search}%`
              );
            });
          }
          if (type !== "all") {
            queryBuilder.where("role", type);
          }
        });

      const users = await query
        .orderBy(sortBy, order)
        .limit(limit)
        .offset((page - 1) * limit);

      return {
        users,
        total: parseInt(total.count),
      };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateUser: async ({ userId, username, newPassword, avatar }) => {
    const trx = await db.transaction();

    try {
      // Create an object to hold the fields that need to be updated
      const updateData = {};

      // Update username if provided
      if (username) {
        updateData.username = username;
      }

      // Update password if provided
      if (newPassword) {
        updateData.password = newPassword;
      }

      if (avatar) {
        updateData.avatar = avatar;
      }
      await trx("users").where({ id: userId }).update(updateData);

      // Commit the transaction
      await trx.commit();

      return { message: "User details updated successfully" };
    } catch (error) {
      await trx.rollback();
      throw new Error(error.message);
    }
  },
  filterUser: async (filters) => {
    try {
      let query = db("users").select("users.*");

      if (filters.username) {
        query = query.where("users.username", "like", `%${filters.username}%`);
      }
      if (filters.email) {
        query = query.where("users.email", "like", `%${filters.email}%`);
      }
      const results = await query;
      return results;
    } catch (Error) {
      throw new Error(Error.message);
    }
  },
  manageUser: async (email, status) => {
    try {
      // Thực hiện truy vấn cập nhật
      const updatedRows = await db("users")
        .where("email", "like", `%${email}%`)
        .update({ status: status });

      if (updatedRows === 0) {
        // Nếu không có bản ghi nào được cập nhật
        return `No user found with email matching "${email}"`;
      }

      // Nếu cập nhật thành công
      return `${updatedRows} user(s) updated with status ${status}`;
    } catch (error) {
      // Xử lý lỗi và ném lại thông báo lỗi
      throw new Error(error.message);
    }
  },
  updateAccountStatus: async (id, status) => {
    try {
      const updatedAccount = await db("users")
        .where("id", id)
        .update({ status: status });

      return updatedAccount;
    } catch (error) {
      throw new Error(error.message);
    }
  },
  updateUser: async (userId, newData) => {
    try {
      return await db("users").where({ id: userId }).update(newData);
    } catch (error) {
      throw new Error(error.message);
    }
  },
};

export default UserModel;
