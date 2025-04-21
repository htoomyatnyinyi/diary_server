import express from "express";
import { verifyToken, checkRole } from "../middleware/middleware.js";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  searchJobs,
} from "../controllers/jobController.js";

const router = express.Router();

router.get("/", getJobs);
router.get("/search", searchJobs);
router.get("/:id", getJobById);

router.post("/", verifyToken, createJob);
router.put("/:id", verifyToken, updateJob);
router.delete("/:id", verifyToken, deleteJob);

export default router;

// import express from "express";
// import { verifyToken, checkRole } from "../middleware/middleware.js";
// import {
//   createJob,
//   getJobs,
//   getJobById,
//   updateJob,
//   deleteJob,
//   searchJobs,
// } from "../controllers/jobController.js";

// const router = express.Router();

// router.get("/", getJobs);
// router.get("/search", searchJobs);
// router.get("/:id", getJobById);

// router.post("/", verifyToken, checkRole(["employer", "admin"]), createJob);
// router.put("/:id", verifyToken, checkRole(["employer", "admin"]), updateJob);
// router.delete("/:id", verifyToken, checkRole(["employer", "admin"]), deleteJob);

// export default router;
