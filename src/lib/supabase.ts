import { createClient } from "@supabase/supabase-js";

// Service client (full admin access, no user session)
export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
}
