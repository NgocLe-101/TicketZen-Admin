import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import session from "express-session";
import cookieParser from "cookie-parser";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import pkg from "pg";
import passportConfig from "./config/passport.config.js";
passportConfig(passport); // Use the imported passport configuration

const PgSession = connectPgSimple(session);
const { Pool } = pkg;
const app = express();
import fs from "fs";
// Get the current file's path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database connection
const sslConfig =
  process.env.NODE_ENV === "production"
    ? {
        rejectUnauthorized: true,
        ca: fs.readFileSync(new URL("./ca.pem", import.meta.url), "utf-8"),
      }
    : false;

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: sslConfig,
});

// Session middleware
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "users_session",
      errorLog: (err) => {
        console.error("Session Error:", err);
      },
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: false,
      httpOnly: true,
    },
  })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "../public")));

// Routes
import indexRoutes from "./routes/index.js";
app.use(indexRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
