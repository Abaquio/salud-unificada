import "dotenv/config";
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// rutas existentes
app.use("/api/health", healthRoutes);
app.use("/api/patient", patientRoutes);

// NUEVO: login
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Backend Salud Unificada escuchando en http://localhost:${PORT}`);
});
