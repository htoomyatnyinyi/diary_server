import expres from "express";
import { verifyToken, checkRole } from "../middleware/middleware.js";
import { profileImageUploader } from "../controllers/imageController.js";

const router = expres.Router();

router.post("/", verifyToken, profileImageUploader);

export default router;
