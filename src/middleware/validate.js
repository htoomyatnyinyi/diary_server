import { body, query, param, validationResult } from "express-validator";

const jobPostValidationRules = [
  body("title")
    .notEmpty()
    .isLength({ min: 3, max: 255 })
    .withMessage("Title must be 3-255 characters"),
  body("description")
    .notEmpty()
    .isLength({ min: 10 })
    .withMessage("Description must be at least 10 characters"),
  body("employment_type")
    .notEmpty()
    .isIn([
      "full_time",
      "part_time",
      "contract",
      "internship",
      "apprenticeship",
    ])
    .withMessage("Invalid employment type"),
  body("salary_min")
    .optional()
    .isNumeric()
    .withMessage("Salary min must be a number"),
  body("salary_max")
    .optional()
    .isNumeric()
    .withMessage("Salary max must be a number"),
  body("location")
    .optional()
    .isLength({ max: 255 })
    .withMessage("Location must be under 255 characters"),
  body("category")
    .optional()
    .isLength({ max: 100 })
    .withMessage("Category must be under 100 characters"),
  body("application_deadline")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format (use YYYY-MM-DD)"),
  body("requirements")
    .optional()
    .isArray()
    .withMessage("Requirements must be an array"),
  body("responsibilities")
    .optional()
    .isArray()
    .withMessage("Responsibilities must be an array"),
];

const jobPostFilterValidationRules = [
  query("title").optional().isLength({ max: 255 }),
  query("location").optional().isLength({ max: 255 }),
  query("category").optional().isLength({ max: 100 }),
  query("employment_type")
    .optional()
    .isIn([
      "full_time",
      "part_time",
      "contract",
      "internship",
      "apprenticeship",
    ]),
  query("salary_min").optional().isNumeric(),
  query("salary_max").optional().isNumeric(),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

const jobIdValidationRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Job ID must be a positive integer"),
];

const applicationStatusValidationRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Application ID must be a positive integer"),
  body("status")
    .notEmpty()
    .isIn([
      "pending",
      "reviewed",
      "interviewed",
      "offered",
      "rejected",
      "withdrawn",
    ])
    .withMessage("Invalid status value"),
];

const userIdValidationRules = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("User ID must be a positive integer"),
];

const employerProfileValidationRules = [
  body("company_name")
    .notEmpty()
    .isLength({ max: 255 })
    .withMessage("Company name is required"),
  body("contact_phone")
    .notEmpty()
    .isLength({ max: 20 })
    .withMessage("Contact phone is required"),
  body("address_line").optional().isLength({ max: 255 }),
  body("city").optional().isLength({ max: 100 }),
  body("state").optional().isLength({ max: 100 }),
  body("postal_code").optional().isLength({ max: 20 }),
  body("country").optional().isLength({ max: 100 }),
  body("website_url").optional().isURL().withMessage("Invalid URL"),
  body("industry").optional().isLength({ max: 100 }),
  body("company_description").optional().isLength({ max: 5000 }),
];

const jobSeekerProfileValidationRules = [
  body("first_name")
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage("First name is required"),
  body("last_name")
    .notEmpty()
    .isLength({ max: 100 })
    .withMessage("Last name is required"),
  body("phone")
    .notEmpty()
    .isLength({ max: 20 })
    .withMessage("Phone is required"),
  body("gender")
    .optional()
    .isIn(["male", "female", "other", "prefer_not_to_say"]),
  body("date_of_birth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format"),
  body("location").optional().isLength({ max: 255 }),
  body("bio").optional().isLength({ max: 5000 }),
];

const resumeValidationRules = [
  body("resume").custom((value, { req }) => {
    if (!req.files || !req.files.resume)
      throw new Error("Resume file is required");
    return true;
  }),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export {
  jobPostValidationRules,
  jobPostFilterValidationRules,
  jobIdValidationRules,
  applicationStatusValidationRules,
  userIdValidationRules,
  employerProfileValidationRules,
  jobSeekerProfileValidationRules,
  resumeValidationRules,
  validate,
}; // import { body, query, param } from "express-validator";

// const jobPostValidationRules = [
//   body("title")
//     .notEmpty()
//     .isLength({ min: 3, max: 255 })
//     .withMessage("Title must be 3-255 characters"),
//   body("description")
//     .notEmpty()
//     .isLength({ min: 10 })
//     .withMessage("Description must be at least 10 characters"),
//   body("employment_type")
//     .notEmpty()
//     .isIn([
//       "full_time",
//       "part_time",
//       "contract",
//       "internship",
//       "apprenticeship",
//     ])
//     .withMessage("Invalid employment type"),
//   body("salary_min")
//     .optional()
//     .isNumeric()
//     .withMessage("Salary min must be a number"),
//   body("salary_max")
//     .optional()
//     .isNumeric()
//     .withMessage("Salary max must be a number"),
//   body("location")
//     .optional()
//     .isLength({ max: 255 })
//     .withMessage("Location must be under 255 characters"),
//   body("category")
//     .optional()
//     .isLength({ max: 100 })
//     .withMessage("Category must be under 100 characters"),
//   body("application_deadline")
//     .optional()
//     .isISO8601()
//     .withMessage("Invalid date format (use YYYY-MM-DD)"),
//   body("requirements")
//     .optional()
//     .isArray()
//     .withMessage("Requirements must be an array"),
//   body("responsibilities")
//     .optional()
//     .isArray()
//     .withMessage("Responsibilities must be an array"),
// ];

// const jobPostFilterValidationRules = [
//   query("title").optional().isLength({ max: 255 }),
//   query("location").optional().isLength({ max: 255 }),
//   query("category").optional().isLength({ max: 100 }),
//   query("employment_type")
//     .optional()
//     .isIn([
//       "full_time",
//       "part_time",
//       "contract",
//       "internship",
//       "apprenticeship",
//     ]),
//   query("salary_min").optional().isNumeric(),
//   query("salary_max").optional().isNumeric(),
//   query("page")
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage("Page must be a positive integer"),
//   query("limit")
//     .optional()
//     .isInt({ min: 1 })
//     .withMessage("Limit must be a positive integer"),
// ];

// const jobIdValidationRules = [
//   param("id")
//     .isInt({ min: 1 })
//     .withMessage("Job ID must be a positive integer"),
// ];

// const applicationStatusValidationRules = [
//   param("id")
//     .isInt({ min: 1 })
//     .withMessage("Application ID must be a positive integer"),
//   body("status")
//     .notEmpty()
//     .isIn([
//       "pending",
//       "reviewed",
//       "interviewed",
//       "offered",
//       "rejected",
//       "withdrawn",
//     ])
//     .withMessage("Invalid status value"),
// ];

// const validate = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }
//   next();
// };

// export {
//   jobPostValidationRules,
//   jobPostFilterValidationRules,
//   jobIdValidationRules,
//   applicationStatusValidationRules,
//   validate,
// };
