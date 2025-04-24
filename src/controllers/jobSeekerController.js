import pool from "../config/database.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now(2)}-${file.originalname.replace(ext, "")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
  },
}).single("resume");

// file preview path
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
    if (!fs.existsSync(secureFullPath)) {
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
    // const { file_path, file_type } = resumes[0];
    // const fullPath = path.join(__dirname, "../../uploads", filename);
    // const sqlPath = path.join(__dirname, "../../", file_path);

    // console.log(sqlPath, "\n", fullPath);

    // if (!fs.existsSync(fullPath)) {
    //   return res
    //     .status(404)
    //     .json({ success: false, message: "File not found" });
    // }

    // res.setHeader("Content-Type", file_type);
    // res.sendFile(fullPath, (err) => {
    //   if (err) {
    //     console.error("Error sending file:", err);
    //     return res
    //       .status(500)
    //       .json({ success: false, message: "Error serving file" });
    //   }
    // });
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
  const { first_name, last_name, phone, gender, date_of_birth, location, bio } =
    req.body;

  const userId = req.user.id;
  console.log(userId, " at update");
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
  upload(req, res, async (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });

    // console.log(req.file.filename, req.file, "info");

    const file_path = `/uploads/${req.file.filename}`;
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

// // Resume CRUD
// const createResume = (req, res) => {
//   upload(req, res, async (err) => {
//     if (err)
//       return res.status(400).json({ success: false, message: err.message });

//     console.log(req.file, "info");

//     // const file_path = `/uploads/${req.file.filename}`;
//     // // const file_name = req.file.originalname;
//     // const file_name = req.file.filename;
//     // const file_type = req.file.mimetype;

//     // try {
//     //   const [result] = await pool.query(
//     //     "INSERT INTO resumes (user_id, file_path, file_name, file_type) VALUES (?, ?, ?, ?)",
//     //     [req.user.id, file_path, file_name, file_type]
//     //   );
//     //   res.status(201).json({ success: true, id: result.insertId });
//     // } catch (error) {
//     //   res.status(500).json({ success: false, message: error.message });
//     // }
//   });
// };

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

// const deleteResume = async (req, res) => {
//   const userId = req.user.id;
//   const resumeId = req.params.id;

//   try {
//     // Get resume info
//     const [rows] = await pool.query(
//       "SELECT file_path FROM resumes WHERE id = ? AND user_id = ?",
//       [resumeId, userId]
//     );
//     if (rows.length === 0)
//       return res.status(404).json({ message: "Resume not found" });

//     const filePath = path.resolve(__dirname, "../../", rows[0].file_path);

//     // Delete DB entry
//     await pool.query("DELETE FROM resumes WHERE id = ?", [resumeId]);

//     // Delete file from filesystem
//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath);
//     }

//     res.json({ success: true, message: "Resume deleted successfully" });
//   } catch (error) {
//     console.error("Delete error:", error.message);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const deleteResume = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  console.log(id, "check", userId);
  try {
    await pool.query("DELETE FROM resumes WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);
    res.json({ success: true, message: "Resume deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Saved Jobs CRUD

// const createSavedJob = async (req, res) => {
//   const { job_post_id } = req.body;
//   try {
//     const [result] = await pool.query(
//       "INSERT INTO saved_jobs (user_id, job_post_id) VALUES (?, ?)",
//       [req.user.id, job_post_id]
//     );
//     res.status(201).json({ success: true, id: result.insertId });
//   } catch (error) {
//     if (error.code === "ER_DUP_ENTRY")
//       return res
//         .status(400)
//         .json({ success: false, message: "Job already saved" });
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// update version check

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

  // console.log(
  //   job_post_id,
  //   resume_id,
  //   req.body,
  //   " check at application backend"
  // );

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

// before edit backup same version as above
// // Job Applications CRUD
// const createApplication = async (req, res) => {
//   const userId = req.user.id;
//   const { job_post_id, resume_id } = req.body;
//   const { jobId, resumeId } = req.body;

//   console.log(
//     job_post_id,
//     resume_id,
//     req.body,∑∑∑
//     " check at application backend"
//   );

//   try {
//     const [result] = await pool.query(
//       "INSERT INTO job_applications (user_id, job_post_id, resume_id, status) VALUES (?, ?, ?, ?)",
//       [req.user.id, job_post_id, resume_id || null, "pending"]
//     );
//     res.status(201).json({ success: true, id: result.insertId });
//   } catch (error) {
//     if (error.code === "ER_DUP_ENTRY")
//       return res
//         .status(400)
//         .json({ success: false, message: "Already applied" });
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

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
    // const [[a]] = await pool.query(
    //   "SELECT COUNT(*) as savedJob FROM saved_jobs WHERE user_id=3"
    // );
    const [[a]] = await pool.query(
      "SELECT DATE (sj.saved_at) as date, COUNT(*) as savedJob FROM saved_jobs sj WHERE user_id=3 GROUP BY date ORDER BY date ASC"
    );
    const [[b]] = await pool.query(
      "SELECT COUNT(*) as appliedJob FROM job_applications WHERE user_id=3"
    );
    const [[c]] = await pool.query(
      "SELECT COUNT(*) as uploadResumes FROM resumes WHERE user_id=3"
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
    const [[{ count, date }]] = await pool.query(
      "SELECT DATE(sj.saved_at) as date, COUNT(*) as count FROM saved_jobs sj WHERE user_id=3 GROUP BY date ORDER BY date ASC"
    );
    console.log(a, b, c, count, date, " at bakend analytics");

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
        savedJobTrend: { date, count },
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
