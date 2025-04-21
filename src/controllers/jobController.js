import pool from "../config/database.js";
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

const createJob = (req, res) => {
  upload(req, res, async (err) => {
    if (err)
      return res.status(400).json({ success: false, message: err.message });

    const {
      title,
      description,
      salary_min,
      salary_max,
      location,
      address,
      employment_type,
      category,
      requirements,
      responsibilities,
      application_deadline,
    } = req.body;
    console.log("backend: ", req.body);

    const employerId = req.user.id;

    console.log(employerId, " check employer idfrom verifyToken");

    const company_logo_url = req.files?.company_logo
      ? `/uploads/logo/${req.files.company_logo[0].filename}`
      : null;
    const post_image_url = req.files?.post_image
      ? `/uploads/logo/${req.files.post_image[0].filename}`
      : null;

    // const company_logo_url = req.files?.company_logo
    //   ? `/uploads/logo/${req.files.company_logo[0].filename}`
    //   : null;
    // const post_image_url = req.files?.post_image
    //   ? `/uploads/logo/${req.files.post_image[0].filename}`
    //   : null;

    console.log(company_logo_url, post_image_url, " at req.body");

    try {
      const [employer] = await pool.query(
        "SELECT company_name FROM employer_profiles WHERE user_id = ?",
        [employerId]
      );
      if (employer.length === 0)
        return res
          .status(404)
          .json({ success: false, message: "Employer profile not found" });

      const { company_name } = employer[0];
      console.log(company_name);

      // const postJobQuery = `INSERT INTO job_posts (employer_id, title, description, salary_min, salary_max,
      //   location, address, employment_type, category, company_name, company_logo_url,
      //   post_image_url, application_deadline, is_active)
      //    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) `;
      // const postJobParams = [
      //   employerId,
      //   title,
      //   description,
      //   salary_min,
      //   salary_max || null,
      //   location || null,
      //   address || null,
      //   employment_type,
      //   category || null,
      //   company_name,
      //   company_logo_url,
      //   post_image_url,
      //   application_deadline || null,
      //   (is_active = true),
      // ];

      const postJobQuery = `INSERT INTO job_posts (employer_id, title, description, salary_min, salary_max, location, address, employment_type, category, post_image_url, application_deadline, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const postJobParams = [
        employerId,
        title,
        description,
        salary_min,
        salary_max === undefined ? null : salary_max,
        location === undefined ? null : location,
        address === undefined ? null : address,
        employment_type,
        category === undefined ? null : category,
        post_image_url,
        application_deadline === undefined ? null : application_deadline,
        true,
      ];

      const [result] = await pool.query(postJobQuery, postJobParams);

      const jobId = result.insertId;
      console.log("Job post inserted successfully. Job ID:", result.insertId);

      if (requirements && Array.isArray(requirements)) {
        const reqValues = requirements.map((req, index) => [jobId, req, index]);
        await pool.query(
          "INSERT INTO job_requirements (job_post_id, requirement, display_order) VALUES ?",
          [reqValues]
        );
      }

      if (responsibilities && Array.isArray(responsibilities)) {
        const respValues = responsibilities.map((resp, index) => [
          jobId,
          resp,
          index,
        ]);
        await pool.query(
          "INSERT INTO job_responsibilities (job_post_id, responsibility, display_order) VALUES ?",
          [respValues]
        );
      }

      res.status(201).json({ success: true, id: jobId });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

// debug
const getJobs = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [jobs] = await pool.query(
      "SELECT * FROM job_posts WHERE is_active = TRUE LIMIT ? OFFSET ?",
      [Number(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      "SELECT COUNT(*) as total FROM job_posts WHERE is_active = TRUE"
    );

    for (let job of jobs) {
      const [requirements] = await pool.query(
        "SELECT requirement FROM job_requirements WHERE job_post_id = ? ORDER BY display_order",
        [job.id]
      );
      const [responsibilities] = await pool.query(
        "SELECT responsibility FROM job_responsibilities WHERE job_post_id = ? ORDER BY display_order",
        [job.id]
      );
      job.requirements = requirements.map((r) => r.requirement);
      job.responsibilities = responsibilities.map((r) => r.responsibility);
    }
    res.json({
      success: true,
      data: jobs, // later check here no i saw but i will check it later.
      pagination: {
        page: Number(page),
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// const getJobs = async (req, res) => {
//   const { page = 1, limit = 10 } = req.query;
//   const offset = (page - 1) * limit;
//   try {
//     const [jobs] = await pool.query(
//       "SELECT * FROM job_posts WHERE is_active = TRUE LIMIT ? OFFSET ?",
//       [Number(limit), offset]
//     );
//     const [[{ total }]] = await pool.query(
//       "SELECT COUNT(*) as total FROM job_posts WHERE is_active = TRUE"
//     );
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
//     res.json({
//       success: true,
//       data: jobs,
//       pagination: {
//         page: Number(page),
//         totalPages: Math.ceil(total / limit),
//         total,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const getJobById = async (req, res) => {
  const { id } = req.params;
  try {
    const [jobs] = await pool.query(
      "SELECT * FROM job_posts WHERE id = ? AND is_active = TRUE",
      [id]
    );
    if (jobs.length === 0)
      return res.status(404).json({ success: false, message: "Job not found" });
    const job = jobs[0];
    const [requirements] = await pool.query(
      "SELECT requirement FROM job_requirements WHERE job_post_id = ? ORDER BY display_order",
      [id]
    );
    const [responsibilities] = await pool.query(
      "SELECT responsibility FROM job_responsibilities WHERE job_post_id = ? ORDER BY display_order",
      [id]
    );
    job.requirements = requirements.map((r) => r.requirement);
    job.responsibilities = responsibilities.map((r) => r.responsibility);
    res.json({ success: true, data: job });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateJob = (req, res) => {
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
      requirements,
      responsibilities,
      application_deadline,
    } = req.body;

    const company_logo_url = req.files?.company_logo
      ? `/uploads/${req.files.company_logo[0].filename}`
      : null;
    const post_image_url = req.files?.post_image
      ? `/uploads/${req.files.post_image[0].filename}`
      : null;

    try {
      const [job] = await pool.query(
        "SELECT employer_id FROM job_posts WHERE id = ?",
        [id]
      );
      if (job.length === 0 || job[0].employer_id !== req.user.id)
        return res
          .status(404)
          .json({ success: false, message: "Job not found or unauthorized" });

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
        values.push(salary_min);
      }
      if (salary_max) {
        updates.push("salary_max = ?");
        values.push(salary_max);
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
      if (company_logo_url) {
        updates.push("company_logo_url = ?");
        values.push(company_logo_url);
      }
      if (post_image_url) {
        updates.push("post_image_url = ?");
        values.push(post_image_url);
      }
      if (application_deadline) {
        updates.push("application_deadline = ?");
        values.push(application_deadline);
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
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

const deleteJob = async (req, res) => {
  const { id } = req.params;
  try {
    const [job] = await pool.query(
      "SELECT employer_id FROM job_posts WHERE id = ?",
      [id]
    );
    if (job.length === 0 || job[0].employer_id !== req.user.id)
      return res
        .status(404)
        .json({ success: false, message: "Job not found or unauthorized" });
    await pool.query("DELETE FROM job_posts WHERE id = ?", [id]);
    res.json({ success: true, message: "Job deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const searchJobs = async (req, res) => {
  const {
    title,
    location,
    category,
    employment_type,
    salary_min,
    salary_max,
    page = 1,
    limit = 10,
  } = req.query;
  const offset = (page - 1) * limit;
  try {
    let whereClauses = ["is_active = TRUE"];
    const queryParams = [];
    if (title) {
      whereClauses.push("title LIKE ?");
      queryParams.push(`%${title}%`);
    }
    if (location) {
      whereClauses.push("location LIKE ?");
      queryParams.push(`%${location}%`);
    }
    if (category) {
      whereClauses.push("category = ?");
      queryParams.push(category);
    }
    if (employment_type) {
      whereClauses.push("employment_type = ?");
      queryParams.push(employment_type);
    }
    if (salary_min) {
      whereClauses.push("salary_max >= ?");
      queryParams.push(Number(salary_min));
    }
    if (salary_max) {
      whereClauses.push("salary_min <= ?");
      queryParams.push(Number(salary_max));
    }

    const sql = `SELECT id, title, location, salary_min, salary_max, employment_type, category, posted_at
      FROM job_posts ${
        whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : ""
      } ORDER BY posted_at DESC LIMIT ? OFFSET ?`;
    const countSql = `SELECT COUNT(*) as total FROM job_posts ${
      whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : ""
    }`;

    const [jobs] = await pool.query(sql, [
      ...queryParams,
      Number(limit),
      offset,
    ]);
    const [[{ total }]] = await pool.query(countSql, queryParams);

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
    res.status(500).json({ success: false, message: error.message });
  }
};

export { createJob, getJobs, getJobById, updateJob, deleteJob, searchJobs };

// / debug
// const searchJobs = async (req, res) => {
//   const {
//     title,
//     location,
//     category,
//     employment_type,
//     salary_min,
//     salary_max,
//     page = 1,
//     limit = 10,
//   } = req.query;
//   const offset = (page - 1) * limit;

//   try {
//     let whereClauses = ["is_active = TRUE"];
//     const queryParams = [];

//     if (title) {
//       whereClauses.push("title LIKE ?");
//       queryParams.push(`%${title}%`);
//     }
//     if (location) {
//       whereClauses.push("location LIKE ?");
//       queryParams.push(`%${location}%`);
//     }
//     if (category) {
//       whereClauses.push("category = ?");
//       queryParams.push(category);
//     }
//     if (employment_type) {
//       whereClauses.push("employment_type = ?");
//       queryParams.push(employment_type);
//     }
//     if (salary_min) {
//       whereClauses.push("salary_max >= ?");
//       queryParams.push(Number(salary_min));
//     }
//     if (salary_max) {
//       whereClauses.push("salary_min <= ?");
//       queryParams.push(Number(salary_max));
//     }

//     const sql = `
//             SELECT id, title, company_name, location, salary_min, salary_max, employment_type, category,
//             company_logo_url, posted_at
//             FROM job_posts
//             ${whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : ""}
//             ORDER BY posted_at DESC
//             LIMIT ? OFFSET ?
//         `;
//     const countSql = `
//             SELECT COUNT(*) as total
//             FROM job_posts
//             ${whereClauses.length ? "WHERE " + whereClauses.join(" AND ") : ""}
//         `;

//     const [jobs] = await pool.query(sql, [
//       ...queryParams,
//       Number(limit),
//       offset,
//     ]);
//     const [[{ total }]] = await pool.query(countSql, queryParams);

//     res.json({
//       success: true,
//       data: jobs,
//       pagination: {
//         page: Number(page),
//         totalPages: Math.ceil(total / limit),
//         total,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
