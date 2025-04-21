import pool from "../config/database.js";
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/logo";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // cb(null, `${file.originalname}`);
    cb(null, `${Date.now()}-${file.originalname.replace(ext, "")}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPEG, PNG, and GIF images are allowed"));
  },
}).fields([
  { name: "company_logo", maxCount: 1 },
  { name: "post_image", maxCount: 1 },
]);

export const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Assuming bcrypt is imported
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, role || "job_seeker", true]
    );
    res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role, is_active } = req.body;
  try {
    const updates = [];
    const values = [];
    if (username) {
      updates.push("username = ?");
      values.push(username);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (password) {
      updates.push("password = ?");
      values.push(await bcrypt.hash(password, 10));
    }
    if (role) {
      updates.push("role = ?");
      values.push(role);
    }
    if (typeof is_active === "boolean") {
      updates.push("is_active = ?");
      values.push(is_active);
    }

    if (updates.length) {
      values.push(id);
      await pool.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
        values
      );
    }
    res.json({ success: true, message: "User updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  const { page = 1, limit = 10, role } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query = "SELECT id, username, email, role, is_active FROM users";
    const params = [];
    if (role) {
      query += " WHERE role = ?";
      params.push(role);
    }
    query += " LIMIT ? OFFSET ?";
    params.push(Number(limit), offset);

    const [users] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(
      role
        ? "SELECT COUNT(*) as total FROM users WHERE role = ?"
        : "SELECT COUNT(*) as total FROM users",
      role ? [role] : []
    );

    console.log("Users Pagination:", {
      page: Number(page),
      limit: Number(limit),
      offset,
      total,
    }); // Debug log
    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getJobs = async (req, res) => {
  const { page = 1, limit = 10, is_active, category } = req.query;
  const offset = (page - 1) * limit;
  try {
    let whereClauses = [];
    const params = [];
    if (is_active !== undefined && is_active !== "") {
      whereClauses.push("is_active = ?");
      params.push(is_active === "true");
    }
    if (category && category !== "") {
      whereClauses.push("category = ?");
      params.push(category);
    }

    const query = `SELECT * FROM job_posts ${
      whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : ""
    } LIMIT ? OFFSET ?`;
    params.push(Number(limit), offset);

    const countQuery = `SELECT COUNT(*) as total FROM job_posts ${
      whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : ""
    }`;

    const [jobs] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(countQuery, params.slice(0, -2));
    console.log("Jobs Pagination:", {
      page: Number(page),
      limit: Number(limit),
      offset,
      total,
    }); // Debug log

    // add on by me and old getJob delete
    //     for (let job of jobs) {
    //       const [requirements] = await pool.query(
    //         "SELECT requirement FROM job_requirements WHERE job_post_id = ? ORDER BY display_order",
    //         [job.id]
    //       );
    //       const [responsibilities] = await pool.query(
    //         "SELECT responsibility FROM job_responsibilities WHERE job_post_id = ? ORDER BY display_order",
    //         [job.id]
    //       );
    //       job.requirements = requirements.map((r) => r.requirement);
    //       job.responsibilities = responsibilities.map((r) => r.responsibility);
    //     }
    res.json({
      success: true,
      data: jobs,
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    console.error("Get Jobs Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateJob = async (req, res) => {
  upload(req, res, async (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });

    const { id } = req.params;
    const {
      title,
      description,
      salary_min,
      salary_max,
      location,
      address,
      employment_type,
      category,
      application_deadline,
      is_active,
      requirements,
      responsibilities,
    } = req.body;
    console.log(application_deadline, " check");

    const company_logo_url = req.files?.company_logo
      ? `/uploads/logo/${req.files.company_logo[0].filename}`
      : null;
    const post_image_url = req.files?.post_image
      ? `/uploads/logo/${req.files.post_image[0].filename}`
      : null;

    try {
      const updates = [];
      const values = [];
      if (title) {
        updates.push("title = ?");
        values.push(title);
      }
      if (description) {
        updates.push("description = ?");
        values.push(description);
      }
      if (salary_min) {
        updates.push("salary_min = ?");
        values.push(Number(salary_min));
      }
      if (salary_max) {
        updates.push("salary_max = ?");
        values.push(Number(salary_max));
      }
      if (location) {
        updates.push("location = ?");
        values.push(location);
      }
      if (address) {
        updates.push("address = ?");
        values.push(address);
      }
      if (employment_type) {
        updates.push("employment_type = ?");
        values.push(employment_type);
      }
      if (category) {
        updates.push("category = ?");
        values.push(category);
      }
      if (application_deadline) {
        updates.push("application_deadline = ?");
        values.push(application_deadline);
      } // Expecting yyyy-MM-dd
      if (is_active !== undefined) {
        updates.push("is_active = ?");
        values.push(is_active === "true" || is_active === true);
      }
      if (company_logo_url) {
        updates.push("company_logo_url = ?");
        values.push(company_logo_url);
      }
      if (post_image_url) {
        updates.push("post_image_url = ?");
        values.push(post_image_url);
      }

      if (updates.length) {
        values.push(id);
        await pool.query(
          `UPDATE job_posts SET ${updates.join(", ")} WHERE id = ?`,
          values
        );
      }

      if (requirements && Array.isArray(requirements)) {
        await pool.query("DELETE FROM job_requirements WHERE job_post_id = ?", [
          id,
        ]);
        const reqValues = requirements.map((req, index) => [id, req, index]);
        await pool.query(
          "INSERT INTO job_requirements (job_post_id, requirement, display_order) VALUES ?",
          [reqValues]
        );
      }

      if (responsibilities && Array.isArray(responsibilities)) {
        await pool.query(
          "DELETE FROM job_responsibilities WHERE job_post_id = ?",
          [id]
        );
        const respValues = responsibilities.map((resp, index) => [
          id,
          resp,
          index,
        ]);
        await pool.query(
          "INSERT INTO job_responsibilities (job_post_id, responsibility, display_order) VALUES ?",
          [respValues]
        );
      }

      res.json({ success: true, message: "Job updated" });
    } catch (error) {
      console.error("Update Job Error:", error); // Detailed logging
      res.status(500).json({
        success: false,
        message: error.message,
        sqlError: error.sqlMessage,
      });
    }
  });
};

export const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM job_posts WHERE id = ?", [id]);
    res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
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
      data: { total_users, total_jobs, total_applications },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT DISTINCT category FROM job_posts WHERE category IS NOT NULL"
    );
    res.json({ success: true, data: categories.map((c) => c.category) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
