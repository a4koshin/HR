import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import userRouter from "./routes/userRoute.js";
import departmentRouter from "./routes/departmentRoute.js";
import employeeRouter from "./routes/employeeRoute.js";
import attendanceRouter from "./routes/attendanceRoute.js";
import shiftRouter from "./routes/shiftRoute.js";
import payrollRouter from "./routes/payrollRoute.js";
import leaveRouter from "./routes/leaveRoute.js";
import trainingRouter from "./routes/trainingRoute.js";
import recruitmentRouter from "./routes/recruitmentRoute.js";
import applicantRouter from "./routes/applicantRoute.js";
import documentRouter from "./routes/documentRoute.js";
import roleRouter from "./routes/roleRoutes.js";
// dotenv
dotenv.config();
const app = express();


const port = process.env.PORT || 3001;
// Allow both localhost (dev) and Vercel frontend (prod)
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://hr-syss.vercel.app",// deployed frontend
];

// middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

//ROutes
app.use("/api/auth", userRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/shifts", shiftRouter);
app.use("/api/payrolls", payrollRouter);
app.use("/api/leaves", leaveRouter);
app.use("/api/trainings", trainingRouter);
app.use("/api/recruitment", recruitmentRouter);
app.use("/api/applicants", applicantRouter);
app.use("/api/documents", documentRouter);
app.use("/api/roles", roleRouter);

// Databse config
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`App runs on port ${port}`);
  });
});
