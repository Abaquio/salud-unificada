import express from "express";
import { updateProfile } from "../controllers/profile.controller.js";

const router = express.Router();

router.put("/:id", updateProfile);

export default router;
