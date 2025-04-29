import pool from "../config/database.js";
import { fileURLToPath } from "url";
import fileUploads from "../middleware/fileUploads.js";
import path from "path";
import fsPromises from "fs/promises";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const fileResumes = async (req, res) => {
  const { filename } = req.params;
  const userId = req.user.id;

  if (!filename || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Filename and user ID are required" });
  }

  try {
    // Verify the resume belongs to the user
    const [resumes] = await pool.query(
      "SELECT file_path, file_type FROM resumes WHERE user_id = ? AND file_name = ?",
      [userId, filename]
    );

    if (!resumes.length) {
      return res
        .status(403)
        .json({ success: false, message: "Unauthorized or file not found" });
    }

    // Inside the try block, after validating resumes.length
    const { file_path, file_type } = resumes[0];
    // Assume file_path from DB is like "uploads/user_xyz/resume_abc.pdf"
    // Construct the full path based *only* on the DB value and a reliable base path.
    // Using process.cwd() or a dedicated base path variable is often better than __dirname
    // if your uploads folder isn't always relative to *this specific file's* directory.
    // Let's assume a base path relative to the project root:

    const basePath = path.resolve(__dirname, "../../"); // Or better: process.cwd() if applicable
    const secureFullPath = path.join(basePath, file_path); // USE THIS PATH

    console.log("Attempting to serve file from DB path:", secureFullPath);
    try {
      await fs.promises.access(secureFullPath, fs.constants.F_OK);
      // file exists
    } catch (err) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    res.setHeader("Content-Type", file_type);
    res.sendFile(secureFullPath, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        return res
          .status(500)
          .json({ success: false, message: "Error serving file" });
      }
    });
  } catch (error) {
    console.error("Error fetching resume:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Job Seeker Profile CRUD

const createProfile = async (req, res) => {
  const userId = req.user.id;
  const { first_name, last_name, phone, gender, date_of_birth, location, bio } =
    req.body;
  console.log(userId, req.body, "at crate profile");
  try {
    const [result] = await pool.query(
      "INSERT INTO job_seeker_profiles (user_id, first_name, last_name, phone, gender, date_of_birth, location, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        first_name,
        last_name,
        phone,
        gender || "prefer_not_to_say",
        date_of_birth || null,
        location || null,
        bio || null,
      ]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const [profile] = await pool.query(
      "SELECT * FROM job_seeker_profiles WHERE user_id = ?",
      [req.user.id]
    );
    if (profile.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    res.json({ success: true, data: profile[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;

  const { first_name, last_name, phone, gender, date_of_birth, location, bio } =
    req.body;
  console.log(req.body, " at update profile ");

  try {
    const updates = [];
    const values = [];
    if (first_name) {
      updates.push("first_name = ?");
      values.push(first_name);
    }
    if (last_name) {
      updates.push("last_name = ?");
      values.push(last_name);
    }
    if (phone) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (gender) {
      updates.push("gender = ?");
      values.push(gender);
    }
    if (date_of_birth) {
      updates.push("date_of_birth = ?");
      values.push(date_of_birth);
    }
    if (location) {
      updates.push("location = ?");
      values.push(location);
    }
    if (bio) {
      updates.push("bio = ?");
      values.push(bio);
    }

    if (updates.length) {
      values.push(req.user.id);
      await pool.query(
        `UPDATE job_seeker_profiles SET ${updates.join(
          ", "
        )} WHERE user_id = ?`,
        values
      );
    }
    res.json({ success: true, message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProfile = async (req, res) => {
  try {
    await pool.query("DELETE FROM job_seeker_profiles WHERE user_id = ?", [
      req.user.id,
    ]);
    res.json({ success: true, message: "Profile deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Resume CRUD
const createResume = (req, res) => {
  fileUploads.single("resume")(req, res, async (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const file_path = `/uploads/resume_docs/${req.file.filename}`;
    // const file_name = req.file.originalname;
    const file_name = req.file.filename;
    const file_type = req.file.mimetype;
    try {
      const [result] = await pool.query(
        "INSERT INTO resumes (user_id, file_path, file_name, file_type) VALUES (?, ?, ?, ?)",
        [req.user.id, file_path, file_name, file_type]
      );

      res.status(201).json({ success: true, id: result.insertId });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

const getResumes = async (req, res) => {
  const userId = req.user.id;
  try {
    const [resumes] = await pool.query(
      "SELECT id, file_name, file_path, file_type, uploaded_at FROM resumes WHERE user_id = ?",
      [userId]
    );
    res.json({ success: true, data: resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteResume = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id; // Assuming req.user.id is set by auth middleware

  if (!id || !userId) {
    // Basic validation
    return res
      .status(400)
      .json({ success: false, message: "Resume ID and User ID are required" });
  }

  let queryFilePath = null; // To store the path from the DB

  try {
    // 1. Get the file path from the database AND verify ownership in one query
    const [resumes] = await pool.query(
      "SELECT file_path FROM resumes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    // Check if the resume exists and belongs to the user
    if (resumes.length === 0) {
      // If no record found, it's either already deleted or doesn't belong to user.
      // Returning 404 is appropriate.
      return res.status(404).json({
        success: false,
        message: "Resume not found or you do not have permission to delete it",
      });
    }

    queryFilePath = resumes[0].file_path;

    // Only attempt file deletion if a path was actually stored
    if (queryFilePath) {
      // 2. Construct the FULL, RELIABLE path to the file
      // It's often better to use a base path relative to the project root (process.cwd())
      // or an absolute path from configuration, rather than __dirname.
      // Adjust this basePath according to your project structure/configuration.
      const basePath = path.resolve(__dirname, "../../"); // Example: base path relative to this file's parent's parent
      const fullPathToDelete = path.join(basePath, queryFilePath);

      console.log(`Attempting to delete file: ${fullPathToDelete}`);

      // 3. Attempt to delete the file from the filesystem asynchronously
      try {
        await fsPromises.unlink(fullPathToDelete);
        console.log(`Successfully deleted file: ${fullPathToDelete}`);
      } catch (fileError) {
        // Handle errors during file deletion
        if (fileError.code === "ENOENT") {
          // ENOENT means "Error NO ENTry" or "File Not Found".
          // This is often okay - maybe it was already deleted or never existed.
          console.warn(
            `File not found, likely already deleted: ${fullPathToDelete}`
          );
        } else {
          // For other errors (like permissions), log it but maybe proceed
          // depending on desired behavior. Here, we log and will proceed to delete DB record.
          console.error(
            `Error deleting file ${fullPathToDelete}: ${fileError.message}. Proceeding with DB record deletion.`
          );
          // Optional: If file deletion failure should prevent DB deletion, you could:
          // return res.status(500).json({ success: false, message: "Failed to delete resume file." });
        }
      }
    } else {
      console.log(
        `No file_path stored in database for resume ID: ${id}. Skipping file deletion.`
      );
    }

    // 4. Delete the record from the database
    // The WHERE clause ensures we only delete the specific record for the specific user
    const [deleteResult] = await pool.query(
      "DELETE FROM resumes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    // Check if a row was actually deleted (should be 1 if the initial select found it)
    if (deleteResult.affectedRows === 0) {
      // This case should ideally be caught by the initial SELECT, but as a safeguard:
      console.warn(
        `DB record for resume ID ${id} and user ID ${userId} was not found for deletion, though it was selected earlier.`
      );
      // You might return 404 here too, or adjust based on how this state could occur.
    }

    // 5. Send success response
    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    // Catch errors from database queries or unexpected issues
    console.error("Error during resume deletion process:", error);
    // Avoid sending response if headers already sent (less likely here, but good practice)
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: "An internal error occurred while deleting the resume.",
      }); // Use a generic message
    }
  }
};

const createSavedJob = async (req, res) => {
  const userId = req.user.id;
  const { job_post_id } = req.body; // job_post_id destructure form the rtk query.

  // console.log(userId, job_post_id, req.body, "check at backend");
  try {
    const checkSavedQuery = `SELECT * FROM saved_jobs WHERE user_id= ? AND job_post_id=?`;
    const checkSavedParams = [userId, job_post_id];
    const [row] = await pool.query(checkSavedQuery, checkSavedParams);
    console.log(row, " check");
    if (row.length === 0) {
      const [result] = await pool.query(
        "INSERT INTO saved_jobs (user_id, job_post_id) VALUES (?, ?)",
        [userId, job_post_id]
      );

      // later update the return data for savedjob
      res.status(201).json({ success: true, id: result.insertId });
    } else {
      res.status(204).json({ success: true, message: "Already Saved job" });
    }
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ success: false, message: "Job already saved" });
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSavedJobs = async (req, res) => {
  // the previous code there is no sj.job_post_id, i add the job_post_id return data for save job section.
  try {
    const [savedJobs] = await pool.query(
      "SELECT sj.id, sj.job_post_id, jp.title FROM saved_jobs sj JOIN job_posts jp ON sj.job_post_id = jp.id WHERE sj.user_id = ?",
      [req.user.id]
    );
    console.log(savedJobs, "check");
    res.json({ success: true, data: savedJobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSavedJob = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM saved_jobs WHERE id = ? AND user_id = ?", [
      id,
      req.user.id,
    ]);
    res.json({ success: true, message: "Saved job deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Job Applications CRUD
const createApplication = async (req, res) => {
  const userId = req.user.id;
  // const { job_post_id, resume_id } = req.body; // frontedn doesn't send data with job_post_id so no use.
  const { jobId, resumeId } = req.body;

  try {
    const [result] = await pool.query(
      "INSERT INTO job_applications (user_id, job_post_id, resume_id, status) VALUES (?, ?, ?, ?)",
      [userId, jobId, resumeId || null, "pending"]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY")
      return res
        .status(400)
        .json({ success: false, message: "Already applied" });
    res.status(500).json({ success: false, message: error.message });
  }
};

const getApplications = async (req, res) => {
  try {
    const [applications] = await pool.query(
      "SELECT ja.id, ja.job_post_id, ja.resume_id, ja.status, jp.title FROM job_applications ja JOIN job_posts jp ON ja.job_post_id = jp.id WHERE ja.user_id = ?",
      [req.user.id]
    );
    res.json({ success: true, data: applications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteApplication = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      "DELETE FROM job_applications WHERE id = ? AND user_id = ?",
      [id, req.user.id]
    );
    res.json({ success: true, message: "Application deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// User Analytics
const getUserAnalytics = async (req, res) => {
  // userId = 3;
  try {
    const [[a]] = await pool.query(
      "SELECT COUNT(*) as savedJob FROM saved_jobs WHERE user_id=?",
      [req.user.id]
    );
    // const [[a]] = await pool.query(
    //   "SELECT DATE (sj.saved_at) as date, COUNT(*) as savedJob FROM saved_jobs sj WHERE user_id=3 GROUP BY date ORDER BY date ASC"
    // );
    const [[b]] = await pool.query(
      "SELECT COUNT(*) as appliedJob FROM job_applications WHERE user_id=?",
      [req.user.id]
    );
    const [[c]] = await pool.query(
      "SELECT COUNT(*) as uploadResumes FROM resumes WHERE user_id=?",
      [req.user.id]
    );
    // const [[a]] = await pool.query(
    //   "SELECT COUNT(*) as savedJob FROM saved_jobs WHERE user_id=3"
    // );
    // const [[b]] = await pool.query(
    //   "SELECT COUNT(*) as appliedJob FROM job_applications WHERE user_id=3"
    // );
    // const [[c]] = await pool.query(
    //   "SELECT COUNT(*) as uploadResumes FROM resumes WHERE user_id=3"
    // );
    // Replace this:
    // const [[a]] = await pool.query(
    //   "SELECT DATE (sj.applied_at) as date, COUNT(*) as savedJob FROM saved_jobs sj WHERE user_id=3 ORDER BY date ASC"
    // );

    // With this to get daily saved job trend:
    // const [[{ count, date }]] = await pool.query(
    //   "SELECT DATE(sj.saved_at) as date, COUNT(*) as count FROM saved_jobs sj WHERE user_id=3 GROUP BY date ORDER BY date ASC"
    // );
    // console.log(a, b, c, count, date, " at bakend analytics");

    const [[{ total_users }]] = await pool.query(
      "SELECT COUNT(*) as total_users FROM users"
    );
    const [[{ total_jobs }]] = await pool.query(
      "SELECT COUNT(*) as total_jobs FROM job_posts"
    );
    const [[{ total_applications }]] = await pool.query(
      "SELECT COUNT(*) as total_applications FROM job_applications"
    );
    res.json({
      success: true,
      data: {
        total_users,
        total_jobs,
        total_applications,
        total_savedJobs: a.savedJob,
        total_appliedJobs: b.appliedJob,
        total_uploadedResumes: c.uploadResumes,
        // savedJobTrend: { date, count },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  getUserAnalytics,
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
};
