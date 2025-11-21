import { Router } from "express";
import { getPatientByRut } from "../controllers/patient.controller.js";

const router = Router();

router.get("/:rut", getPatientByRut);

export default router;