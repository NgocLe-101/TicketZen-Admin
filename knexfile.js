import dotenv from "dotenv";
dotenv.config();
// Path now works as expected
const config = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      port: process.env.DB_PORT,
      ssl: false,
    },
    migrations: {
      directory: "./dbs/migrations",
    },
    seeds: {
      directory: "./dbs/seeds",
    },
  },

  production: {
    client: "pg",
    connection: {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    migrations: {
      directory: "./dbs/migrations",
    },
    seeds: {
      directory: "./dbs/seeds",
    },
  },
};

export default config[process.env.NODE_ENV || "development"];
