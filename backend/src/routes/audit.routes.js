// backend/src/routes/audit.routes.js
import { Router } from "express";
import { getSearchHistory } from "../controllers/audit.controller.js";

const router = Router();

// GET /api/auditoria/busquedas
router.get("/busquedas", getSearchHistory);

export default router;
