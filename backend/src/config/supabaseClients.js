import { createClient } from "@supabase/supabase-js";

const {
  SUPABASE_CORE_URL,
  SUPABASE_CORE_SERVICE_ROLE_KEY,
  SUPABASE_RAYEN_URL,
  SUPABASE_RAYEN_SERVICE_ROLE_KEY,
} = process.env;

// Cliente orientado a datos del hospital (CORE)
export const coreClient = createClient(
  SUPABASE_CORE_URL,
  SUPABASE_CORE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);

// Cliente orientado a APS (Rayen)
export const rayenClient = createClient(
  SUPABASE_RAYEN_URL,
  SUPABASE_RAYEN_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false },
  }
);