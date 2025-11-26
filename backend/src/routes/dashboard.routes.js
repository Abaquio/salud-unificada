import express from "express";
import {
  getDashboardSummary,
  getDashboardFull,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

router.get("/summary", getDashboardSummary);
router.get("/full", getDashboardFull);

export default router;
