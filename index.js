import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { initializeDatabase } from "./src/config/database.js";

import { fileURLToPath } from "url"; // update
import path from "path"; // update

import authRoutes from "./src/routes/authRoutes.js";
import employerRoutes from "./src/routes/employerRoutes.js";
import jobSeekerRoutes from "./src/routes/JobSeekerRoutes.js";
import jobRoutes from "./src/routes/jobRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";

dotenv.config();

const app = express();

// Define __dirname for ES modules // update for
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// app.use(
//   cors({
//     origin: (origin, callback) => {
//       const allowedOrigins = process.env.FRONTEND_URL; //"http://localhost:5173" // before edit it
//       // console.log(`CORS origin check: ${origin} allow ${allowedOrigins}`);

//       // const allowedOrigins = [process.env.FRONTEND_URL].filter(Boolean);
//       // allowedOrigins
//       //   ? console.log(`CORS origin check: allow ${allowedOrigins}`)
//       //   : console.log(`Opps! Please check the origin URL : ${origin}`);

//       if (!origin || allowedOrigins.includes(origin)) callback(null, true);
//       else callback(new Error("Not allowed by CORS"));
//     },
//     credentials: true,

//     // methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     // allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );

// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || "http://localhost:5173",
//     credentials: true,
//   })
// );
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://jobdiary-server.vercel.app",
    credentials: true,
  })
);

// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
//   next();
// });

app.use(express.json());
app.use(cookieParser());

// app.use("/uploads", express.static("uploads")); // old no need to import path and pathtorurl
// In your main server file (e.g., app.js or server.js)
// app.use("/uploads", express.static(path.join(__dirname, "../../uploads"))); // update

// even comment this there is no effective
app.use("/uploads", express.static(path.join(__dirname, "../../uploads"))); // update
// app.use("/uploads", express.static(path.join(__dirname, "./uploads"))); // update

app.use("/api/auth", authRoutes);
app.use("/api/employer", employerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", jobSeekerRoutes);
app.use("/api/job-posts", jobRoutes);

app.get("/", (req, res) => res.send("Job Diary API"));

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res
    .status(500)
    .json({ message: "Internal server error", error: err.message });
});

initializeDatabase();

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`SERVER_IS_RUNNING_ON:${PORT}`));
