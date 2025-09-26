import express from "express";
import cors from "cors";
import cookieparser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// dotenv
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// middleware
app.use(express.json());

// routes

// Databse config
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`App runs on port ${port}`);
  });
});
