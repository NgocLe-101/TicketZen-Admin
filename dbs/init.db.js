import knex from "knex";
import config from "../knexfile.js";

const db = knex(config);

// Export db
export default db;
