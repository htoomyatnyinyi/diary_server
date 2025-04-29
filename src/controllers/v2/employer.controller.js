// import pool from "../config/database.js";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url"; // userAppliedProfile with Resume
// import sanitize from "sanitize-filename";

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = "uploads/";
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const sanitizedName = sanitize(file.originalname.replace(ext, ""));
//     cb(null, `${Date.now()}-${sanitizedName}${ext}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
//     if (allowedTypes.includes(file.mimetype)) cb(null, true);
//     else cb(new Error("Only JPEG, PNG, and GIF images are allowed"));
//   },
// }).fields([{ name: "logo" }, { name: "company_logo" }, { name: "post_image" }]);

// // Profile CRUD
// // const createProfile = (req, res) => {
// //   upload(req, res, async (err) => {
// //     if (err)
// //       return res.status(400).json({ success: false, message: err.message });

// //     const {
// //       company_name,
// //       contact_phone,
// //       address_line,
// //       city,
// //       state,
// //       postal_code,
// //       country,
// //       website_url,
// //       industry,
// //       company_description,
// //     } = req.body;
// //     const logo_url = req.files?.logo
// //       ? `/uploads/${req.files.logo[0].filename}`
// //       : null;

// //     if (!company_name || !contact_phone) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "Company name and phone are required",
// //       });
// //     }

// //     try {
// //       const [result] = await pool.query(
// //         `INSERT INTO employer_profiles
// //          (user_id, company_name, contact_phone, address_line, city, state, postal_code, country, website_url, industry, company_description, logo_url, status)
// //          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
// //         [
// //           req.user.id, // Assumes req.user.id from auth middleware
// //           company_name,
// //           contact_phone,
// //           address_line || null,
// //           city || null,
// //           state || null,
// //           postal_code || null,
// //           country || null,
// //           website_url || null,
// //           industry || null,
// //           company_description || null,
// //           logo_url,
// //         ]
// //       );
// //       res.status(201).json({ success: true, id: result.insertId });
// //     } catch (error) {
// //       console.error("Database error:", error);
// //       res
// //         .status(500)
// //         .json({ success: false, message: "Failed to create profile" });
// //     }
// //   });
// // };

// // Profile CRUD (unchanged except for clarity)

// const createEmployerProfile = (req, res) => {
//   const userId = req.user.id;
//   upload(req, res, async (err) => {
//     if (err)
//       return res.status(400).json({ success: false, message: err.message });

//     const {
//       company_name,
//       contact_phone,
//       address_line,
//       city,
//       state,
//       postal_code,
//       country,
//       website_url,
//       industry,
//       company_description,
//     } = req.body;

//     const logo_url = req.files?.logo
//       ? `/uploads/${req.files.logo[0].filename}`
//       : null;

//     if (!company_name || !contact_phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Company name and phone are required",
//       });
//     }

//     try {
//       const [rows] = await pool.query(
//         `SELECT * FROM employer_profiles where user_id=?`,
//         [userId]
//       );
//       console.log(rows[0]);
//       if (rows.length > 0) {
//         return res.status(200).json({ message: "Profile Created Already!" });
//       } else {
//         const [result] = await pool.query(
//           `INSERT INTO employer_profiles
//           (user_id, company_name, contact_phone, address_line, city, state, postal_code, country, website_url, industry, company_description, logo_url, status)
//           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
//           [
//             userId,
//             // req.user.id, // From verifyToken
//             company_name,
//             contact_phone,
//             address_line || null,
//             city || null,
//             state || null,
//             postal_code || null,
//             country || null,
//             website_url || null,
//             industry || null,
//             company_description || null,
//             logo_url,
//           ]
//         );
//         res.status(201).json({ success: true, id: result.insertId });
//       }
//     } catch (error) {
//       console.error("Database error:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to create profile" });
//     }
//   });
// };

// const createProfile = (req, res) => {
//   upload(req, res, async (err) => {
//     if (err)
//       return res.status(400).json({ success: false, message: err.message });

//     const {
//       user_id, // if setup cookies no need
//       company_name,
//       contact_phone,
//       address_line,
//       city,
//       state,
//       postal_code,
//       country,
//       website_url,
//       industry,
//       company_description,
//     } = req.body;

//     const logo_url = req.files?.logo
//       ? `/uploads/${req.files.logo[0].filename}`
//       : null;

//     if (!company_name || !contact_phone) {
//       return res.status(400).json({
//         success: false,
//         message: "Company name and phone are required",
//       });
//     }

//     try {
//       const [result] = await pool.query(
//         `INSERT INTO employer_profiles
//          (user_id, company_name, contact_phone, address_line, city, state, postal_code, country, website_url, industry, company_description, logo_url, status)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
//         [
//           user_id,
//           // req.user.id, // From verifyToken
//           company_name,
//           contact_phone,
//           address_line || null,
//           city || null,
//           state || null,
//           postal_code || null,
//           country || null,
//           website_url || null,
//           industry || null,
//           company_description || null,
//           logo_url,
//         ]
//       );
//       res.status(201).json({ success: true, id: result.insertId });
//     } catch (error) {
//       console.error("Database error:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to create profile" });
//     }
//   });
// };

// const getProfile = async (req, res) => {
//   const userId = req.user.id;
//   try {
//     const [profile] = await pool.query(
//       "SELECT * FROM employer_profiles WHERE user_id = ?",
//       [userId]
//     );
//     if (profile.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Profile not found" });
//     }
//     res.json({ success: true, data: profile[0] });
//   } catch (error) {
//     console.error("Database error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch profile" });
//   }
// };

// const updateProfile = (req, res) => {
//   upload(req, res, async (err) => {
//     if (err)
//       return res.status(400).json({ success: false, message: err.message });

//     const {
//       company_name,
//       contact_phone,
//       address_line,
//       city,
//       state,
//       postal_code,
//       country,
//       website_url,
//       industry,
//       company_description,
//       status,
//       subscription_plan,
//     } = req.body;

//     console.log(req.body, "at update profile");

//     const logo_url = req.files?.logo
//       ? `/uploads/${req.files.logo[0].filename}`
//       : null;

//     try {
//       const updates = [];
//       const values = [];
//       if (company_name) {
//         updates.push("company_name = ?");
//         values.push(company_name);
//       }
//       if (contact_phone) {
//         updates.push("contact_phone = ?");
//         values.push(contact_phone);
//       }
//       if (address_line !== undefined) {
//         updates.push("address_line = ?");
//         values.push(address_line || null);
//       }
//       if (city !== undefined) {
//         updates.push("city = ?");
//         values.push(city || null);
//       }
//       if (state !== undefined) {
//         updates.push("state = ?");
//         values.push(state || null);
//       }
//       if (postal_code !== undefined) {
//         updates.push("postal_code = ?");
//         values.push(postal_code || null);
//       }
//       if (country !== undefined) {
//         updates.push("country = ?");
//         values.push(country || null);
//       }
//       if (website_url !== undefined) {
//         updates.push("website_url = ?");
//         values.push(website_url || null);
//       }
//       if (industry !== undefined) {
//         updates.push("industry = ?");
//         values.push(industry || null);
//       }
//       if (company_description !== undefined) {
//         updates.push("company_description = ?");
//         values.push(company_description || null);
//       }
//       if (logo_url) {
//         updates.push("logo_url = ?");
//         values.push(logo_url);
//       }
//       if (status) {
//         updates.push("status = ?");
//         values.push(status);
//       }
//       if (subscription_plan) {
//         updates.push("subscription_plan = ?");
//         values.push(subscription_plan);
//       }

//       if (!updates.length) {
//         return res
//           .status(400)
//           .json({ success: false, message: "No fields to update" });
//       }

//       values.push(req.user.id);
//       const [result] = await pool.query(
//         `UPDATE employer_profiles SET ${updates.join(", ")} WHERE user_id = ?`,
//         values
//       );

//       if (result.affectedRows === 0) {
//         return res
//           .status(404)
//           .json({ success: false, message: "Profile not found" });
//       }

//       res.json({ success: true, message: "Profile updated" });
//     } catch (error) {
//       console.error("Database error:", error);
//       res
//         .status(500)
//         .json({ success: false, message: "Failed to update profile" });
//     }
//   });
// };

// const deleteProfile = async (req, res) => {
//   try {
//     const [result] = await pool.query(
//       "DELETE FROM employer_profiles WHERE user_id = ?",
//       [req.user.id]
//     );
//     if (result.affectedRows === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Profile not found" });
//     }
//     res.json({ success: true, message: "Profile deleted" });
//   } catch (error) {
//     console.error("Database error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to delete profile" });
//   }
// };

// const createJob = (req, res) => {
//   upload(req, res, async (err) => {
//     if (err)
//       return res.status(400).json({ success: false, message: err.message });

//     const {
//       title,
//       description,
//       salary_min,
//       salary_max,
//       location,
//       address,
//       employment_type,
//       category,
//       application_deadline,
//       requirements,
//       responsibilities,
//     } = req.body;

//     const post_image_url = req.files?.post_image
//       ? `/uploads/${req.files.post_image[0].filename}`
//       : null;

//     if (!title || !description || !employment_type) {
//       return res.status(400).json({
//         success: false,
//         message: "Title, description, and employment type are required",
//       });
//     }

//     try {
//       const [result] = await pool.query(
//         `INSERT INTO job_posts
//          (employer_id, title, description, salary_min, salary_max, location, address, employment_type, category, application_deadline, post_image_url, is_active)
//          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)`,
//         [
//           req.user.id,
//           title,
//           description,
//           salary_min || null,
//           salary_max || null,
//           location || null,
//           address || null,
//           employment_type,
//           category || null,
//           application_deadline || null,
//           post_image_url,
//         ]
//       );

//       const jobId = result.insertId;
//       const parsedRequirements = Array.isArray(requirements)
//         ? requirements
//         : JSON.parse(requirements || "[]");
//       const parsedResponsibilities = Array.isArray(responsibilities)
//         ? responsibilities
//         : JSON.parse(responsibilities || "[]");

//       for (const [index, req] of parsedRequirements.entries()) {
//         await pool.query(
//           "INSERT INTO job_requirements (job_post_id, requirement, display_order) VALUES (?, ?, ?)",
//           [jobId, req, index]
//         );
//       }
//       for (const [index, resp] of parsedResponsibilities.entries()) {
//         await pool.query(
//           "INSERT INTO job_responsibilities (job_post_id, responsibility, display_order) VALUES (?, ?, ?)",
//           [jobId, resp, index]
//         );
//       }

//       res.status(201).json({ success: true, id: jobId });
//     } catch (error) {
//       console.error("Database error:", error);
//       res.status(500).json({ success: false, message: "Failed to create job" });
//     }
//   });
// };

// const getOwnJobs = async (req, res) => {
//   const { page = 1, limit = 10 } = req.query;
//   const offset = (page - 1) * limit;

//   try {
//     const [jobs] = await pool.query(
//       `SELECT jp.*,
//               (SELECT COUNT(*) FROM job_applications ja WHERE ja.job_post_id = jp.id) as application_count
//        FROM job_posts jp
//        WHERE jp.employer_id = ?
//        ORDER BY jp.posted_at DESC
//        LIMIT ? OFFSET ?`,
//       [req.user.id, parseInt(limit), parseInt(offset)]
//     );

//     const [total] = await pool.query(
//       "SELECT COUNT(*) as count FROM job_posts WHERE employer_id = ?",
//       [req.user.id]
//     );

//     for (let job of jobs) {
//       const [requirements] = await pool.query(
//         "SELECT requirement, display_order FROM job_requirements WHERE job_post_id = ? ORDER BY display_order",
//         [job.id]
//       );
//       const [responsibilities] = await pool.query(
//         "SELECT responsibility, display_order FROM job_responsibilities WHERE job_post_id = ? ORDER BY display_order",
//         [job.id]
//       );
//       job.requirements = requirements.map((r) => r.requirement);
//       job.responsibilities = responsibilities.map((r) => r.responsibility);
//     }

//     res.json({
//       success: true,
//       data: jobs,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: total[0].count,
//       },
//     });
//   } catch (error) {
//     console.error("Database error:", error);
//     res.status(500).json({ success: false, message: "Failed to fetch jobs" });
//   }
// };

// const updateJob = (req, res) => {
//   upload(req, res, async (err) => {
//     if (err)
//       return res.status(400).json({ success: false, message: err.message });

//     const { jobId } = req.params;
//     const {
//       title,
//       description,
//       salary_min,
//       salary_max,
//       location,
//       address,
//       employment_type,
//       category,
//       application_deadline,
//       is_active,
//       requirements,
//       responsibilities,
//     } = req.body;
//     const post_image_url = req.files?.post_image
//       ? `/uploads/${req.files.post_image[0].filename}`
//       : null;

//     try {
//       const updates = [];
//       const values = [];
//       if (title) {
//         updates.push("title = ?");
//         values.push(title);
//       }
//       if (description) {
//         updates.push("description = ?");
//         values.push(description);
//       }
//       if (salary_min !== undefined) {
//         updates.push("salary_min = ?");
//         values.push(salary_min || null);
//       }
//       if (salary_max !== undefined) {
//         updates.push("salary_max = ?");
//         values.push(salary_max || null);
//       }
//       if (location !== undefined) {
//         updates.push("location = ?");
//         values.push(location || null);
//       }
//       if (address !== undefined) {
//         updates.push("address = ?");
//         values.push(address || null);
//       }
//       if (employment_type) {
//         updates.push("employment_type = ?");
//         values.push(employment_type);
//       }
//       if (category) {
//         updates.push("category = ?");
//         values.push(category);
//       }
//       if (application_deadline) {
//         updates.push("application_deadline = ?");
//         values.push(application_deadline);
//       }
//       if (is_active !== undefined) {
//         updates.push("is_active = ?");
//         values.push(is_active);
//       }
//       if (post_image_url) {
//         updates.push("post_image_url = ?");
//         values.push(post_image_url);
//       }

//       if (updates.length) {
//         values.push(jobId, req.user.id);
//         const [result] = await pool.query(
//           `UPDATE job_posts SET ${updates.join(
//             ", "
//           )} WHERE id = ? AND employer_id = ?`,
//           values
//         );
//         if (result.affectedRows === 0) {
//           return res.status(404).json({
//             success: false,
//             message: "Job not found or not owned by you",
//           });
//         }
//       }

//       if (requirements) {
//         await pool.query("DELETE FROM job_requirements WHERE job_post_id = ?", [
//           jobId,
//         ]);
//         const parsedRequirements = Array.isArray(requirements)
//           ? requirements
//           : JSON.parse(requirements);
//         for (const [index, req] of parsedRequirements.entries()) {
//           await pool.query(
//             "INSERT INTO job_requirements (job_post_id, requirement, display_order) VALUES (?, ?, ?)",
//             [jobId, req, index]
//           );
//         }
//       }
//       if (responsibilities) {
//         await pool.query(
//           "DELETE FROM job_responsibilities WHERE job_post_id = ?",
//           [jobId]
//         );
//         const parsedResponsibilities = Array.isArray(responsibilities)
//           ? responsibilities
//           : JSON.parse(responsibilities);
//         for (const [index, resp] of parsedResponsibilities.entries()) {
//           await pool.query(
//             "INSERT INTO job_responsibilities (job_post_id, responsibility, display_order) VALUES (?, ?, ?)",
//             [jobId, resp, index]
//           );
//         }
//       }

//       res.json({ success: true, message: "Job updated" });
//     } catch (error) {
//       console.error("Database error:", error);
//       res.status(500).json({ success: false, message: "Failed to update job" });
//     }
//   });
// };

// const deleteJob = async (req, res) => {
//   const { jobId } = req.params;

//   try {
//     await pool.query("DELETE FROM job_requirements WHERE job_post_id = ?", [
//       jobId,
//     ]);
//     await pool.query("DELETE FROM job_responsibilities WHERE job_post_id = ?", [
//       jobId,
//     ]);
//     const [result] = await pool.query(
//       "DELETE FROM job_posts WHERE id = ? AND employer_id = ?",
//       [jobId, req.user.id]
//     );

//     if (result.affectedRows === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Job not found or not owned by you" });
//     }
//     res.json({ success: true, message: "Job deleted" });
//   } catch (error) {
//     console.error("Database error:", error);
//     res.status(500).json({ success: false, message: "Failed to delete job" });
//   }
// };

// // All Jobs
// const getAllJobs = async (req, res) => {
//   const { page = 1, limit = 10 } = req.query;
//   const offset = (page - 1) * limit;

//   try {
//     const [jobs] = await pool.query(
//       `SELECT jp.*, ep.company_name
//        FROM job_posts jp
//        LEFT JOIN employer_profiles ep ON jp.employer_id = ep.user_id
//        WHERE jp.is_active = TRUE
//        ORDER BY jp.posted_at DESC
//        LIMIT ? OFFSET ?`,
//       [parseInt(limit), parseInt(offset)]
//     );

//     const [total] = await pool.query(
//       "SELECT COUNT(*) as count FROM job_posts WHERE is_active = TRUE"
//     );

//     res.json({
//       success: true,
//       data: jobs,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: total[0].count,
//       },
//     });
//   } catch (error) {
//     console.error("Database error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch all jobs" });
//   }
// };

// const getAppliedJobs = async (req, res) => {
//   const { page = 1, limit = 10 } = req.query;
//   const offset = (page - 1) * limit;

//   console.log(
//     "Fetching applied jobs for user:",
//     req.user.id,
//     "Page:",
//     page,
//     "Limit:",
//     limit
//   );

//   try {
//     const [jobs] = await pool.query(
//       `SELECT jp.*,
//               COUNT(ja.id) as application_count,
//               JSON_ARRAYAGG(JSON_OBJECT('id', ja.id, 'user_id', ja.user_id,
//               'resume_id', ja.resume_id, 'status', ja.status, 'applied_at', ja.applied_at,
//               'updated_at', ja.updated_at)) as applications
//        FROM job_posts jp
//        LEFT JOIN job_applications ja ON jp.id = ja.job_post_id
//        WHERE jp.employer_id = ?
//        GROUP BY jp.id
//        ORDER BY jp.posted_at DESC
//        LIMIT ? OFFSET ?`,
//       [req.user.id, parseInt(limit), parseInt(offset)]
//     );
//     // console.log("Jobs fetched:", jobs);

//     const [total] = await pool.query(
//       "SELECT COUNT(*) as count FROM job_posts WHERE employer_id = ?",
//       [req.user.id]
//     );
//     // console.log("Total count:", total);

//     for (let job of jobs) {
//       const [requirements] = await pool.query(
//         "SELECT requirement, display_order FROM job_requirements WHERE job_post_id = ? ORDER BY display_order",
//         [job.id]
//       );
//       const [responsibilities] = await pool.query(
//         "SELECT responsibility, display_order FROM job_responsibilities WHERE job_post_id = ? ORDER BY display_order",
//         [job.id]
//       );

//       job.requirements = requirements.map((r) => r.requirement);
//       job.responsibilities = responsibilities.map((r) => r.responsibility);

//       // Handle applications: if already an array, use it; if NULL, set to empty array
//       job.applications = Array.isArray(job.applications)
//         ? job.applications
//         : [];
//       // console.log(`Job ${job.id} - Parsed applications:`, job.applications);
//     }

//     res.json({
//       success: true,
//       data: jobs,
//       pagination: {
//         page: parseInt(page),
//         limit: parseInt(limit),
//         total: total[0].count,
//       },
//     });
//   } catch (error) {
//     console.error("Database error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch applied jobs",
//       error: error.message,
//     });
//   }
// };

// const getAnalytics = async (req, res) => {
//   try {
//     const [jobStats] = await pool.query(
//       `SELECT
//          DATE(posted_at) as date,
//          COUNT(*) as job_count
//        FROM job_posts
//        WHERE employer_id = ?
//        GROUP BY DATE(posted_at)
//        ORDER BY date ASC`,
//       [req.user.id]
//     );

//     const [applicationStats] = await pool.query(
//       `SELECT
//          DATE(ja.applied_at) as date,
//          COUNT(*) as application_count
//        FROM job_applications ja
//        JOIN job_posts jp ON ja.job_post_id = jp.id
//        WHERE jp.employer_id = ?
//        GROUP BY DATE(ja.applied_at)
//        ORDER BY date ASC`,
//       [req.user.id]
//     );

//     const [totalJobs] = await pool.query(
//       "SELECT COUNT(*) as count FROM job_posts WHERE employer_id = ?",
//       [req.user.id]
//     );

//     const [totalApplications] = await pool.query(
//       `SELECT COUNT(*) as count
//        FROM job_applications ja
//        JOIN job_posts jp ON ja.job_post_id = jp.id
//        WHERE jp.employer_id = ?`,
//       [req.user.id]
//     );

//     res.json({
//       success: true,
//       data: {
//         jobStats,
//         applicationStats,
//         totalJobs: totalJobs[0].count,
//         totalApplications: totalApplications[0].count,
//       },
//     });
//   } catch (error) {
//     console.error("Database error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch analytics" });
//   }
// };

// // update
// const updateApplicationStatus = async (req, res) => {
//   const { applicationId } = req.params;
//   const { status } = req.body;
//   const userId = req.user.id;
//   console.log(req.body, req.params, "check updateApplicationStatsu req data");

//   if (
//     ![
//       "pending",
//       "reviewed",
//       "interviewed",
//       "offered",
//       "rejected",
//       "withdrawn",
//     ].includes(status)
//   ) {
//     return res.status(400).json({ success: false, message: "Invalid status" });
//   }

//   try {
//     const query = `
//       UPDATE job_applications ja
//       JOIN job_posts jp ON ja.job_post_id = jp.id
//       SET ja.status = ?
//       WHERE ja.id = ? AND jp.employer_id = ?
//     `;

//     // console.log("Executing query:", query);
//     // console.log("With values:", [status, applicationId, userId]);

//     const [result] = await pool.query(query, [status, applicationId, userId]);

//     // console.log("Query result:", result);

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "Application not found or not owned by you",
//       });
//     }

//     res.json({ success: true, message: "Application status updated" });
//   } catch (error) {
//     console.error("Database error:", error);
//     res
//       .status(500)
//       .json({ success: false, message: "Failed to update application status" });
//   }
// };

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// const getUserProfileById = async (req, res) => {
//   const { id } = req.params;
//   const employer_id = req.user?.id;
//   const isDownload = req.query.download === "true"; // Check if file download is requested

//   if (!employer_id) {
//     return res
//       .status(401)
//       .json({ success: false, message: "Unauthorized: Employer ID missing" });
//   }

//   try {
//     // Fetch profile and resume for the specific user_id
//     const [profile] = await pool.query(
//       `SELECT
//         jsp.id AS profile_id,
//         r.id AS resume_id,
//         jsp.user_id,
//         jsp.first_name,
//         jsp.last_name,
//         jsp.phone,
//         jsp.gender,
//         jsp.date_of_birth,
//         jsp.location,
//         jsp.bio,
//         jsp.profile_image_url,
//         jsp.cover_image_url,
//         jsp.created_at AS profile_created_at,
//         jsp.updated_at AS profile_updated_at,
//         r.file_path,
//         r.file_name,
//         r.file_type,
//         r.uploaded_at,
//         r.updated_at AS resume_updated_at
//       FROM
//         job_seeker_profiles jsp
//       LEFT JOIN
//         resumes r ON jsp.user_id = r.user_id
//       WHERE
//         jsp.user_id = ?`,
//       [id]
//     );

//     if (!profile || profile.length === 0) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Profile not found" });
//     }

//     // If download is requested, serve the resume file
//     if (isDownload) {
//       if (!profile[0].file_name) {
//         return res.status(404).json({
//           success: false,
//           message: "No resume found for this profile",
//         });
//       }

//       const filePath = path.join(
//         __dirname,
//         "../../uploads",
//         profile[0].file_name
//       );

//       if (!fs.existsSync(filePath)) {
//         console.error("File not found:", filePath);
//         return res
//           .status(404)
//           .json({ success: false, message: "Resume file not found" });
//       }

//       res.setHeader("Content-Type", profile[0].file_type || "application/pdf");
//       return res.sendFile(filePath, (err) => {
//         if (err) {
//           console.error("Error sending file:", err);
//           return res
//             .status(500)
//             .json({ success: false, message: "Error serving file" });
//         }
//         console.log("Successfully served:", filePath);
//       });
//     }

//     // Return JSON with profile data and resume download URL
//     const resumeDownloadUrl = profile[0].file_name
//       ? `${req.protocol}://${req.get("host")}/api/profiles/${id}?download=true`
//       : null;

//     return res.status(200).json({
//       success: true,
//       data: {
//         ...profile[0],
//         resumeDownloadUrl, // Add download URL to the response
//       },
//     });
//   } catch (error) {
//     console.error("Database error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch profile" });
//   }
// };

// // Optional: Add a route to serve files directly if needed
// const downloadResume = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const [profile] = await pool.query(
//       `SELECT r.file_name, r.file_type
//        FROM resumes r
//        WHERE r.id = ?`,
//       [id]
//     );
//     // console.log(profile[0].file_name);

//     if (!profile || profile.length === 0 || !profile[0].file_name) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Resume not found" });
//     }

//     const filePath = path.join(
//       __dirname,
//       "../../uploads",
//       profile[0].file_name
//     );

//     if (!fs.existsSync(filePath)) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Resume file not found" });
//     }

//     res.setHeader("Content-Type", profile[0].file_type || "application/pdf");
//     res.sendFile(filePath, (err) => {
//       if (err) {
//         console.error("Error sending file:", err);
//         return res
//           .status(500)
//           .json({ success: false, message: "Error serving file" });
//       }
//       console.log("Successfully served:", filePath);
//     });
//   } catch (error) {
//     console.error("Database error:", error);
//     return res
//       .status(500)
//       .json({ success: false, message: "Failed to fetch resume" });
//   }
// };

// // // FOR PREVIEW INDIVIDUAL PROFILE WHO APPLY THE JOB WITH RESUME
// // // file preview path
// // const __dirname = path.dirname(fileURLToPath(import.meta.url));
// // const getUserProfileById = async (req, res) => {
// //   const { id } = req.params;
// //   // console.log(id, req.params, "from employer to get user profile");

// //   const employer_id = req.user.id;
// //   if (!employer_id) console.log("No Employer Id at getUserProfileById");

// //   try {
// //     // const [profile] = await pool.query(
// //     //   "SELECT * FROM job_seeker_profiles WHERE user_id = ?",
// //     //   [id]
// //     // );

// //     const [profile] = await pool.query(`SELECT
// //     jsp.id AS profile_id,
// //     r.id AS resume_id,
// //     jsp.user_id,
// //     jsp.first_name,
// //     jsp.last_name,
// //     jsp.phone,
// //     jsp.gender,
// //     jsp.date_of_birth,
// //     jsp.location,
// //     jsp.bio,
// //     jsp.profile_image_url,
// //     jsp.cover_image_url,
// //     jsp.created_at AS profile_created_at,
// //     jsp.updated_at AS profile_updated_at,
// //     r.file_path,
// //     r.file_name,
// //     r.file_type,
// //     r.uploaded_at,
// //     r.updated_at AS resume_updated_at
// // FROM
// //     job_seeker_profiles jsp
// // LEFT JOIN
// //     resumes r ON jsp.user_id = r.user_id`);

// //     if (profile.length === 0) {
// //       return res
// //         .status(404)
// //         .json({ success: false, message: "Profile not found" });
// //     }
// //     const filePath = path.join(
// //       __dirname,
// //       "../../uploads",
// //       profile[0].file_name
// //     );
// //     console.log(profile[0], profile[0].file_name, filePath);
// //     if (!fs.existsSync(filePath)) {
// //       console.error("File not found: ", filePath);
// //       return res.status(404).json({ error: "resume File Not Found" });
// //     }
// //     // res.json({ success: true, data: profile[0] })
// //     res
// //       .status(200)
// //       .json({ success: true, data: profile[0] })
// //       // .setHeader("Content-Type", "application/pdf")
// //       .sendFile(filePath, (err) => {
// //         if (err) {
// //           console.error("Error sending file:", err);
// //           return res.status(500).json({ error: "Error serving file" });
// //         } else {
// //           console.log("Successfully served:", filePath);
// //         }
// //       });
// //   } catch (error) {
// //     console.error("Database error:", error);
// //     res
// //       .status(500)
// //       .json({ success: false, message: "Failed to fetch profile" });
// //   }
// // };

// export {
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
//   getUserProfileById,
//   downloadResume,
//   createEmployerProfile,
// };
