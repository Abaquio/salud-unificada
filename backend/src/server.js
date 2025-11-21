import "dotenv/config";
import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.routes.js";
import patientRouter from "./routes/patient.routes.js";

const app = express();

// Middlewares base
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/health", healthRouter);
app.use("/api/patient", patientRouter);

// Puerto desde .env o 4000 por defecto
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`✅ Backend Salud Unificada escuchando en http://localhost:${PORT}`);
});