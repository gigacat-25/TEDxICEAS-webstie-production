import { createClient } from "@supabase/supabase-js";

// Use placeholder fallbacks during build time to prevent compilation crashes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL (using placeholder fallback)");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Use this only in backend/server environments (API routes)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

