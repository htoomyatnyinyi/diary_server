import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { initializeDatabase } from "./src/config/database.js";

import { fileURLToPath } from "url";
import path from "path";
// import fs from "fs";

import authRoutes from "./src/routes/authRoutes.js";
import employerRoutes from "./src/routes/employerRoutes.js";
import jobSeekerRoutes from "./src/routes/JobSeekerRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import uploadRoutess from "./src/routes/uploadRoutes.js";

dotenv.config();

const app = express();

// Define __dirname for ES modules // update for
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);

//       if (!origin || allowedOrigins.includes(origin)) callback(null, true);
//       else callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,

//     // methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     // allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

app.use(
  cors({
    origin: "https://jobdiary.vercel.app", // Frontend origin
    credentials: true,
    // methods: ["GET", "POST", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(cookieParser());

// -- STATIC FILE SERVING (FOR UPLOADS) ---
// SERVE FILE FROM THE 'UPLOADS' FOLDER AT THE 'UPLOADS' URL PATH
// EXAMPLE : GET http://localhost:8080/uploads/logo-3432343-33.png
app.use(
  "/uploads",
  express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads"))
);

app.get("/", (req, res) =>
  res.status(200).send("Job Diary BACKEND API IS RUNNING ")
);

app.use("/api/auth", authRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", jobSeekerRoutes);
app.use("/api/job-posts", jobRoutes);
app.use("/api/upload", uploadRoutess);

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ message: "Internal SERVER ERROR index", error: err.message });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  initializeDatabase();
  console.log(`SERVER_IS_RUNNING_ON:${PORT}`);
});
