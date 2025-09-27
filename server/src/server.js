import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import departmentRouter from "./routes/departmentRoute.js";
import EmployeeRouter from "./routes/employeeRoute.js";
// dotenv
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
//ROutes
app.use("/api/auth", userRouter);

// Databse config
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`App runs on port ${port}`);
  });
});
