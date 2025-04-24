import pool from "../config/database.js";
import upload from "../middleware/upload.js";

const resumeUploader = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });
    console.log(req.file);

    try {
      // const [result] = await pool.query();
      res.status(201).json({ mesage: "profileImageUploaded" });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  });
};

export { resumeUploader };
