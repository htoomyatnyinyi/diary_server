import pool from "../config/database.js";
import { fileURLToPath } from "url";
import fileUploads from "../middleware/fileUploads.js";
import path from "path";
import fs from "fs/promises";
import { validate } from "express-validation"; // Example validation library
import Joi from "joi"; // For schema validation
import { v4 as uuidv4 } from "uuid"; // For unique file names
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR =
  process.env.UPLOADS_DIR || path.resolve(__dirname, "../../uploads");

// Centralized error handler
const handleError = (res, error, message = "Internal server error") => {
  console.error(`${message}:`, error);
  res.status(500).json({ success: false, message });
};

// Validation schemas
const profileSchema = Joi.object({
  first_name: Joi.string().min(1).max(50).required(),
  last_name: Joi.string().min(1).max(50).required(),
  phone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional(),
  gender: Joi.string().valid("male", "female", "prefer_not_to_say").optional(),
  date_of_birth: Joi.date().iso().optional(),
  location: Joi.string().max(100).optional(),
  bio: Joi.string().max(500).optional(),
});

// File serving endpoint
const fileResumes = async (req, res) => {
  const { filename } = req.params;
  const userId = req.user.id;

  if (!filename || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Filename and user ID are required" });
  }

  try {
    const [resumes] = await pool.query(
      "SELECT file_path, file_type FROM resumes WHERE user_id = ? AND file_name = ?",
      [userId, filename]
    );

    if (!resumes.length) {
      return res
        .status(404)
        .json({ success: false, message: "File not found or unauthorized" });
    }

    const { file_path, file_type } = resumes[0];
    const secureFullPath = path.join(UPLOADS_DIR, file_path);

    // Prevent path traversal
    if (!secureFullPath.startsWith(UPLOADS_DIR)) {
      return res
        .status(403)
        .json({ success: false, message: "Invalid file path" });
    }

    if (
      !(await fs
        .access(secureFullPath)
        .then(() => true)
        .catch(() => false))
    ) {
      return res
        .status(404)
        .json({ success: false, message: "File not found" });
    }

    res.setHeader("Content-Type", file_type);
    res.sendFile(secureFullPath, (err) => {
      if (err) {
        handleError(res, err, "Error serving file");
      }
    });
  } catch (error) {
    handleError(res, error, "Error fetching resume");
  }
};

// Job Seeker Profile CRUD
const createProfile = async (req, res) => {
  const userId = req.user.id;
  const { error, value } = profileSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { first_name, last_name, phone, gender, date_of_birth, location, bio } =
    value;

  try {
    const [result] = await pool.query(
      "INSERT INTO job_seeker_profiles (user_id, first_name, last_name, phone, gender, date_of_birth, location, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        first_name,
        last_name,
        phone || null,
        gender || "prefer_not_to_say",
        date_of_birth || null,
        location || null,
        bio || null,
      ]
    );

    // Return the created resource
    const [newProfile] = await pool.query(
      "SELECT * FROM job_seeker_profiles WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json({ success: true, data: newProfile[0] });
  } catch (error) {
    handleError(res, error, "Error creating profile");
  }
};

// Update profile with validation
const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { error, value } = profileSchema.validate(req.body, {
    allowUnknown: true,
  });
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const updates = [];
  const values = [];
  Object.entries(value).forEach(([key, val]) => {
    if (val) {
      updates.push(`${key} = ?`);
      values.push(val);
    }
  });

  if (!updates.length) {
    return res
      .status(400)
      .json({ success: false, message: "No fields to update" });
  }

  try {
    values.push(userId);
    const [result] = await pool.query(
      `UPDATE job_seeker_profiles SET ${updates.join(", ")} WHERE user_id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    const [updatedProfile] = await pool.query(
      "SELECT * FROM job_seeker_profiles WHERE user_id = ?",
      [userId]
    );
    res.json({ success: true, data: updatedProfile[0] });
  } catch (error) {
    handleError(res, error, "Error updating profile");
  }
};

// Resume creation with secure file handling
const createResume = (req, res) => {
  fileUploads.single("resume")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const userId = req.user.id;
    const uniqueFileName = `${userId}-${uuidv4()}${path.extname(
      req.file.originalname
    )}`;
    const file_path = `/uploads/resume_docs/${uniqueFileName}`;
    const file_type = req.file.mimetype;
    const file_size = req.file.size;

    try {
      // Move file to secure location
      const newPath = path.join(UPLOADS_DIR, "resume_docs", uniqueFileName);
      await fs.rename(req.file.path, newPath);

      const [result] = await pool.query(
        "INSERT INTO resumes (user_id, file_path, file_name, file_type, file_size) VALUES (?, ?, ?, ?, ?)",
        [userId, file_path, uniqueFileName, file_type, file_size]
      );

      const [newResume] = await pool.query(
        "SELECT * FROM resumes WHERE id = ?",
        [result.insertId]
      );
      res.status(201).json({ success: true, data: newResume[0] });
    } catch (error) {
      handleError(res, error, "Error creating resume");
    }
  });
};

// Delete resume with secure file deletion
const deleteResume = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Resume ID is required" });
  }

  try {
    const [resumes] = await pool.query(
      "SELECT file_path FROM resumes WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (!resumes.length) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found or unauthorized" });
    }

    const { file_path } = resumes[0];
    const fullPath = path.join(UPLOADS_DIR, file_path);

    if (file_path && fullPath.startsWith(UPLOADS_DIR)) {
      try {
        await fs.unlink(fullPath);
      } catch (fileError) {
        if (fileError.code !== "ENOENT") {
          console.warn(`Error deleting file ${fullPath}: ${fileError.message}`);
        }
      }
    }

    const [result] = await pool.query(
      "DELETE FROM resumes WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Resume not found" });
    }

    res.status(204).json({ success: true });
  } catch (error) {
    handleError(res, error, "Error deleting resume");
  }
};

// Example: Paginated getResumes
const getResumes = async (req, res) => {
  const userId = req.user.id;
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [resumes] = await pool.query(
      "SELECT id, file_name, file_path, file_type, uploaded_at FROM resumes WHERE user_id = ? LIMIT ? OFFSET ?",
      [userId, parseInt(limit), parseInt(offset)]
    );

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM resumes WHERE user_id = ?",
      [userId]
    );

    res.json({
      success: true,
      data: resumes,
      meta: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    handleError(res, error, "Error fetching resumes");
  }
};

// Apply similar changes to other endpoints (createSavedJob, getSavedJobs, etc.)
