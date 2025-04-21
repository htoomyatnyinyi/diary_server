import express from "express";
import { verifyToken, checkRole } from "../middleware/middleware.js";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);

router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;

// import express from "express";
// import { verifyToken, checkRole } from "../middleware/middleware.js";
// import {
//   createUser,
//   getUsers,
//   updateUser,
//   deleteUser,
// } from "../controllers/userController.js";

// const router = express.Router();

// router.post("/", verifyToken, checkRole(["admin"]), createUser);
// router.get("/", verifyToken, checkRole(["admin"]), getUsers);

// router.patch("/:id", verifyToken, checkRole(["admin"]), updateUser);
// router.delete("/:id", verifyToken, checkRole(["admin"]), deleteUser);

// export default router;
