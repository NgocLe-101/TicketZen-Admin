import db from "../../dbs/init.db";
class AccountModel {
  async getAllUser({ page, limit, search, type, sortBy, order }) {
    try {
      let query = db("users")
        .select("users.*")
        .modify((queryBuilder) => {
          if (search) {
            queryBuilder.where(() => {
              this.where("username", "ilike", `%${search}%`).orWhere(
                "email",
                "ilike",
                `%${search}%`
              );
            });
          }
          if (type !== "all") {
            queryBuilder.where("type", type);
          }
        });

      const total = await query.clone().count("* as count").first();

      const users = await query
        .orderBy(sortBy, order)
        .limit(limit)
        .offset((page - 1) * limit);

      return { users, total: parseInt(total.count) };
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export default new AccountModel();
