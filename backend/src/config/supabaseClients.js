// backend/src/config/supabaseClients.js
import { createClient } from "@supabase/supabase-js";

const {
  SUPABASE_CORE_URL,
  SUPABASE_CORE_SERVICE_ROLE_KEY,
  SUPABASE_RAYEN_URL,
  SUPABASE_RAYEN_SERVICE_ROLE_KEY,
  SUPABASE_AUDIT_URL,
  SUPABASE_AUDIT_SERVICE_ROLE_KEY,
} = process.env;

function assertEnv(name, value) {
  if (!value) {
    throw new Error(`${name} is required`);
  }
}

// Validamos las variables que sí estás usando
assertEnv("SUPABASE_CORE_URL", SUPABASE_CORE_URL);
assertEnv("SUPABASE_CORE_SERVICE_ROLE_KEY", SUPABASE_CORE_SERVICE_ROLE_KEY);
assertEnv("SUPABASE_RAYEN_URL", SUPABASE_RAYEN_URL);
assertEnv("SUPABASE_RAYEN_SERVICE_ROLE_KEY", SUPABASE_RAYEN_SERVICE_ROLE_KEY);
assertEnv("SUPABASE_AUDIT_URL", SUPABASE_AUDIT_URL);
assertEnv("SUPABASE_AUDIT_SERVICE_ROLE_KEY", SUPABASE_AUDIT_SERVICE_ROLE_KEY);

// Cliente CORE (hospital)
export const coreClient = createClient(
  SUPABASE_CORE_URL,
  SUPABASE_CORE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Cliente RAYEN (APS)
export const rayenClient = createClient(
  SUPABASE_RAYEN_URL,
  SUPABASE_RAYEN_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// Cliente AUDITORÍA (login, búsquedas, usuarios, roles)
export const auditClient = createClient(
  SUPABASE_AUDIT_URL,
  SUPABASE_AUDIT_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);
