import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Routers (make sure to add .js extension)
import schoolRouter from "./routers/school.router.js";
import classRouter from "./routers/class.router.js";
import subjectRouter from "./routers/subject.router.js";
import studentRouter from "./routers/student.router.js";
import teacherRouter from "./routers/teacher.router.js";
import scheduleRouter from "./routers/schedule.router.js";
import noticeRouter from "./routers/notice.router.js";

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  "http://localhost:5173", // dev
  "https://rajgram-school-frontend-dashboard-9.vercel.app", // vercel prod
];
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like curl, Postman) or match list
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed from this origin"));
    }
  },
  credentials: true, // only if you need cookies/auth headers
  exposedHeaders: ["Authorization"], // keep your exposed header
};
app.use(cors(corsOptions));
app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routers
app.use("/api/school", schoolRouter);
app.use("/api/class", classRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/student", studentRouter);
app.use("/api/manageteacher", teacherRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/notice", noticeRouter);

// Start Server
export default app;

// For local dev only
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running locally on port ${PORT}`));
}
