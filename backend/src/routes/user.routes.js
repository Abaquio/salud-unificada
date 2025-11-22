// backend/src/routes/user.routes.js
import { Router } from "express";
import {
  listUsers,
  updateUserStatus,
  createUser,
} from "../controllers/user.controller.js";

const router = Router();

router.get("/", listUsers);
router.patch("/:id/status", updateUserStatus);
router.post("/", createUser);

export default router;
