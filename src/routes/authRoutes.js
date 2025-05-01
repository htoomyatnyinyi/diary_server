// import express from "express";
// import { verifyToken } from "../middleware/middleware.js";

// import {
//   getMe,
//   login,
//   refreshToken,
//   logout,
// } from "../controllers/v2/auth.controller.js";

// const router = express.Router();

// router.post("/login", login);
// router.post("/refresh-token", refreshToken);
// router.post("/logout", logout);

// // main
// router.get("/me", verifyToken, getMe);

// export default router;

import express from "express";
import { verifyToken } from "../middleware/middleware.js";
import {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  registerEmployer,
  googleLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/google", googleLogin);
router.post("/register", register);
router.post("/register_employer", registerEmployer);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

// main
router.get("/me", verifyToken, getMe);

export default router;
