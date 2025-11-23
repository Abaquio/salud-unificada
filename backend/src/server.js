import "dotenv/config";
import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import patientRoutes from "./routes/patient.routes.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import profileRoutes from "./routes/profile.routes.js";



const app = express();
const PORT = process.env.PORT || 4000;

/* ============================
   CORS CONFIG PRODUCCIÓN
   ============================ */
const allowedOrigins = [
  "http://localhost:5173",                 // desarrollo local
  "https://salud-unificada.vercel.app",    // <--- TU FRONT EN PRODUCCIÓN
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Permitir requests sin origin (Postman, server-to-server)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Bloqueado por CORS:", origin);
      return callback(new Error("CORS no permitido"));
    },
    credentials: true,
  })
);

app.use(express.json());

/* ============================
   RUTAS API
   ============================ */

app.use("/api/health", healthRoutes);
app.use("/api/patient", patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

/* ============================
   SERVIDOR
   ============================ */
app.listen(PORT, () => {
  console.log(`Backend Salud Unificada escuchando en http://localhost:${PORT}`);
});
