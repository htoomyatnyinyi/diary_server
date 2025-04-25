import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Setup __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the base uploads path and subfolders
const uploadsPath = path.join(__dirname, "../../uploads");

// console.log(__dirname, uploadsPath);

const subDirectories = {
  image: "profile_img",
  coverImage: "cover_img",
  resume: "resume_docs",
  postImage: "post_img",
};

// Ensure the main uploads folder exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log("Created 'uploads' directory");
}

// Ensure all subfolders exist
Object.values(subDirectories).forEach((subDir) => {
  const dirPath = path.join(uploadsPath, subDir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created sub-directory ${subDir}`);
  }
});

// Setup dynamic storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderKey = file.fieldname;
    const subDir = subDirectories[folderKey];

    if (!subDir) return cb(new Error("Unknown upload type"), null);

    const finalPath = path.join(uploadsPath, subDir);
    cb(null, finalPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = "uploads/";
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     cb(null, `${Date.now(2)}-${file.originalname.replace(ext, "")}${ext}`);
//   },
// });

// File filter: Optional, customize per file type
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    resume: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    image: ["image/jpeg", "image/png", "image/jpg"],
    coverImage: ["image/jpeg", "image/png", "image/jpg"],
    postImage: ["image/jpeg", "image/png", "image/jpg"],
  };

  const allowed = allowedTypes[file.fieldname];
  if (allowed?.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type for ${file.fieldname}`));
  }
};

// Final uploader
const fileUploads = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
  fileFilter,
});

export default fileUploads;

// usage
// Use `.single("fieldname")` or `.fields([{ name: "image" }, { name: "resume" }])` depending on the use case
// import upload from '../../middleware/upload.js';

// const createResume = (req, res) => {
//   upload.single("resume")(req, res, async (err) => {
//     if (err) return res.status(400).json({ message: err.message });
//     console.log("Uploaded resume:", req.file);
//     res.status(201).json({ message: "Resume uploaded successfully" });
//   });
//   upload.fields([
//     { name: "resume", maxCount: 1 },
//     { name: "image", maxCount: 1 },
//   ])(req, res, async (err) => {
//     if (err) return res.status(400).json({ message: err.message });
//     console.log("Files uploaded:", req.files);
//     res.status(201).json({ message: "Files uploaded successfully" });
//   });
// };
