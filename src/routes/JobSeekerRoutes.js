import express from "express";
import { verifyToken, checkRole } from "../middleware/middleware.js";
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  createResume,
  getResumes,
  fileResumes,
  deleteResume,
  createSavedJob,
  getSavedJobs,
  deleteSavedJob,
  createApplication,
  getApplications,
  deleteApplication,
  getUserAnalytics,
  // updateProfileImage,
} from "../controllers/jobSeekerController.js";

const router = express.Router();

router.get("/analytics", verifyToken, getUserAnalytics);
// Profile
router.post("/profile", verifyToken, createProfile);
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);
// router.put("/profile_img", verifyToken, updateProfileImage);
router.delete("/profile", deleteProfile);

// Resumes
router.post("/resumes", verifyToken, createResume);
router.get("/resumes", verifyToken, getResumes);
router.get("/resumes/:filename", verifyToken, fileResumes);
router.delete("/resumes/:id", verifyToken, deleteResume);

// Saved Jobs
router.post("/saved-jobs", verifyToken, createSavedJob);
router.get("/saved-jobs", verifyToken, getSavedJobs);
router.delete("/saved-jobs/:id", verifyToken, deleteSavedJob);

// Applications
router.post("/applications", verifyToken, createApplication);
router.get("/applications", verifyToken, getApplications);
router.delete("/applications/:id", verifyToken, deleteApplication);

export default router;

// import express from "express";
// import { verifyToken, checkRole } from "../middleware/middleware.js";
// import {
//   createProfile,
//   getProfile,
//   updateProfile,
//   deleteProfile,
//   createResume,
//   getResumes,
//   fileResumes,
//   deleteResume,
//   createSavedJob,
//   getSavedJobs,
//   deleteSavedJob,
//   createApplication,
//   getApplications,
//   deleteApplication,
// } from "../controllers/jobSeekerController.js";

// const router = express.Router();

// // Profile
// router.post("/profile", verifyToken, checkRole(["job_seeker"]), createProfile);
// router.get("/profile", verifyToken, checkRole(["job_seeker"]), getProfile);
// router.put("/profile", verifyToken, checkRole(["job_seeker"]), updateProfile);
// router.delete(
//   "/profile",
//   verifyToken,
//   checkRole(["job_seeker"]),
//   deleteProfile
// );

// // Resumes
// router.post("/resumes", verifyToken, checkRole(["job_seeker"]), createResume);
// router.get("/resumes", verifyToken, checkRole(["job_seeker"]), getResumes);
// router.get(
//   "/resumes/:filename",
//   verifyToken,
//   checkRole(["job_seeker"]),
//   fileResumes
// );
// router.delete(
//   "/resumes/:id",
//   verifyToken,
//   checkRole(["job_seeker"]),
//   deleteResume
// );

// // Saved Jobs
// router.post(
//   "/saved-jobs",
//   verifyToken,
//   checkRole(["job_seeker"]),
//   createSavedJob
// );
// router.get("/saved-jobs", verifyToken, checkRole(["job_seeker"]), getSavedJobs);
// router.delete(
//   "/saved-jobs/:id",
//   verifyToken,
//   checkRole(["job_seeker"]),
//   deleteSavedJob
// );

// // Applications
// router.post(
//   "/applications",
//   verifyToken,
//   checkRole(["job_seeker"]),
//   createApplication
// );
// router.get(
//   "/applications",
//   verifyToken,
//   checkRole(["job_seeker"]),
//   getApplications
// );
// router.delete(
//   "/applications/:id",
//   verifyToken,
//   checkRole(["job_seeker"]),
//   deleteApplication
// );

// export default router;
