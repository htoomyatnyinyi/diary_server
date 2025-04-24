import pool from "../config/database.js";
import fileUploads from "../middleware/fileUploads.js";

const profileImageUploader = async (req, res) => {
  // fileUploads.single("image")(req, res, async (err) => {
  //   if (err) return res.status(400).json({ message: "Error" });
  //   console.log(req.file);
  //   try {
  //     res.status(201).json({ message: "It work" });
  //   } catch (error) {
  //     res.status(500).json({ error: "error at upload" });
  //   }
  // });
  fileUploads.fields([
    { name: "resume", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ])(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: err.message });
      console.log("Files uploaded:", req.files);
      res.status(201).json({ message: "Files uploaded successfully" });
    } catch (error) {
      res.status(500).json({ error: "error at upload" });
    }
  });
};

export { profileImageUploader };
