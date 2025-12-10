// backend/src/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import healthRoutes from "./routes/health.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import auditRoutes from "./routes/audit.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// =====================================
// Configuración base
// =====================================
const app = express();
const PORT = process.env.PORT || 4000;

// Necesario para __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// =====================================
// Rutas API
// =====================================
app.use("/api/health", healthRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/auditoria", auditRoutes);
app.use("/api/dashboard", dashboardRoutes);

// =====================================
// Servir FRONTEND (React Vite)
// dist está en: SALUD-UNIFICADA/dist
// =====================================

// Ruta absoluta a la carpeta dist
const distPath = path.join(process.cwd(), "dist");

// Servir archivos estáticos de la SPA
app.use(express.static(distPath));

// Catch-all compatible con Express 5 (NO rompe API)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// =====================================
// Servidor
// =====================================
app.listen(PORT, () => {
  console.log(
    `Backend Salud Unificada escuchando en http://localhost:${PORT}`
  );
});
