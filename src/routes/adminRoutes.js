import express from "express";
import { verifyToken, checkRole } from "../middleware/middleware.js";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getJobs,
  updateJob,
  deleteJob,
  getAnalytics,
  getCategories,
} from "../controllers/adminController.js";

const router = express.Router();

// User Management
router.get("/users", getUsers);
router.post("/users", createUser); // for admin only not from register
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

router.get("/categories", getCategories);

// Job Management
router.get("/job-posts", getJobs);
router.patch("/job-posts/:id", updateJob);
router.delete("/job-posts/:id", deleteJob);

// Analytics
router.get("/analytics", getAnalytics);

export default router;

// import express from "express";
// import { verifyToken, checkRole } from "../middleware/middleware.js";
// import {
//   getUsers,
//   createUser,
//   updateUser,
//   deleteUser,
//   getJobs,
//   updateJob,
//   deleteJob,
//   getAnalytics,
//   getCategories,
// } from "../controllers/adminController.js";

// const router = express.Router();

// // User Management
// router.get("/users", verifyToken, checkRole(["admin"]), getUsers);
// router.post("/users", verifyToken, checkRole(["admin"]), createUser); // for admin only not from register
// router.patch("/users/:id", verifyToken, checkRole(["admin"]), updateUser);
// router.delete("/users/:id", verifyToken, checkRole(["admin"]), deleteUser);

// router.get("/categories", verifyToken, checkRole(["admin"]), getCategories);

// // Job Management
// router.get("/job-posts", verifyToken, checkRole(["admin"]), getJobs);
// router.patch("/job-posts/:id", verifyToken, checkRole(["admin"]), updateJob);
// router.delete("/job-posts/:id", verifyToken, checkRole(["admin"]), deleteJob);

// // Analytics
// router.get("/analytics", verifyToken, checkRole(["admin"]), getAnalytics);

// export default router;
