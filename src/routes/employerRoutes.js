import express from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  createJob,
  getOwnJobs,
  updateJob,
  deleteJob,
  getAllJobs,
  getAppliedJobs,
  getAnalytics,
  updateApplicationStatus,
  getUserProfileById,
  downloadResume,
  createEmployerProfile,
} from "../controllers/employerController.js";
import { verifyToken, checkRole } from "../middleware/middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Restrict to 'employer' role for all employer-specific actions
router.post("/profile", createProfile);
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/create-profile", createEmployerProfile);
router.delete("/profile", deleteProfile);

router.post("/jobs", createJob);
router.get("/jobs", getOwnJobs);
router.put("/jobs/:jobId", updateJob);
router.delete("/jobs/:jobId", deleteJob);
// debug
router.get("/applied-jobs", getAppliedJobs);
router.get("/analytics", getAnalytics);

router.put("/applications/:applicationId/status", updateApplicationStatus);
// router.get("/applications/:applicationId/status");
// Allow broader access to all jobs (e.g., for job seekers or admins too)
router.get("/all-jobs", getAllJobs); // No role restriction, but still requires auth
router.get("/applied-user-profile/:id", getUserProfileById); // update on 19 April 2025
router.get("/applied-user-resume/:id", downloadResume); // update on 19 April 2025

// fetchProfile → /api/employer/profile
// createProfile → /api/employer/profile (POST)
// updateProfile → /api/employer/profile (PUT)
// deleteProfile → /api/employer/profile (DELETE)
// fetchJobs → /api/employer/jobs
// createJob → /api/employer/jobs (POST)
// updateJob → /api/employer/jobs/:jobId (PUT)
// deleteJob → /api/employer/jobs/:jobId (DELETE)
// fetchAllJobs → /api/employer/all-jobs
// fetchAppliedJobs → /api/employer/applied-jobs
// fetchAnalytics → /api/employer/analytics

export default router;

// import express from "express";
// import {
//   createProfile,
//   getProfile,
//   updateProfile,
//   deleteProfile,
//   createJob,
//   getOwnJobs,
//   updateJob,
//   deleteJob,
//   getAllJobs,
//   getAppliedJobs,
//   getAnalytics,
//   updateApplicationStatus,
// } from "../controllers/employerController.js";
// import { verifyToken, checkRole } from "../middleware/middleware.js";

// const router = express.Router();

// // Apply authentication middleware to all routes
// router.use(verifyToken);

// // Restrict to 'employer' role for all employer-specific actions
// router.post("/profile", checkRole(["employer"]), createProfile);
// router.get("/profile", checkRole(["employer"]), getProfile);
// router.put("/profile", checkRole(["employer"]), updateProfile);
// router.delete("/profile", checkRole(["employer"]), deleteProfile);
// router.post("/jobs", checkRole(["employer"]), createJob);
// router.get("/jobs", checkRole(["employer"]), getOwnJobs);
// router.put("/jobs/:jobId", checkRole(["employer"]), updateJob);
// router.delete("/jobs/:jobId", checkRole(["employer"]), deleteJob);
// // debug
// router.get("/applied-jobs", checkRole(["employer"]), getAppliedJobs);
// router.get("/analytics", checkRole(["employer"]), getAnalytics);

// router.put(
//   "/applications/:applicationId/status",
//   checkRole(["employer"]),
//   updateApplicationStatus
// );
// router.get("/applications/:applicationId/status");
// // Allow broader access to all jobs (e.g., for job seekers or admins too)
// router.get("/all-jobs", getAllJobs); // No role restriction, but still requires auth

// // fetchProfile → /api/employer/profile
// // createProfile → /api/employer/profile (POST)
// // updateProfile → /api/employer/profile (PUT)
// // deleteProfile → /api/employer/profile (DELETE)
// // fetchJobs → /api/employer/jobs
// // createJob → /api/employer/jobs (POST)
// // updateJob → /api/employer/jobs/:jobId (PUT)
// // deleteJob → /api/employer/jobs/:jobId (DELETE)
// // fetchAllJobs → /api/employer/all-jobs
// // fetchAppliedJobs → /api/employer/applied-jobs
// // fetchAnalytics → /api/employer/analytics

// export default router;

// end here
// old
// import express from "express";
// import { verifyToken, checkRole } from "../middleware/middleware.js";
// import {
//   createProfile,
//   getProfile,
//   updateProfile,
//   deleteProfile,
// } from "../controllers/employerController.js";

// const router = express.Router();

// router.post("/profile", verifyToken, checkRole(["employer"]), createProfile);
// router.get("/profile", verifyToken, checkRole(["employer"]), getProfile);
// router.put("/profile", verifyToken, checkRole(["employer"]), updateProfile);
// router.delete("/profile", verifyToken, checkRole(["employer"]), deleteProfile);

// export default router;
// Integration with Frontend
// Update your EmployerDashboard.jsx Redux actions to match these endpoints:

// fetchProfile → /api/employer/profile
// createProfile → /api/employer/profile (POST)
// updateProfile → /api/employer/profile (PUT)
// deleteProfile → /api/employer/profile (DELETE)
// fetchJobs → /api/employer/jobs
// createJob → /api/employer/jobs (POST)
// updateJob → /api/employer/jobs/:jobId (PUT)
// deleteJob → /api/employer/jobs/:jobId (DELETE)
// fetchAllJobs → /api/employer/all-jobs
// fetchAppliedJobs → /api/employer/applied-jobs
// fetchAnalytics → /api/employer/analytics
