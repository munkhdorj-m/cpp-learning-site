// NOTE: path kept as lib/supabase/server for compatibility with ~50 imports.
// It no longer talks to Supabase — it returns a MySQL-backed client that
// mimics the supabase-js API (.from().select()..., .rpc(), .auth.getUser()).

import { createDbClient } from "@/lib/mysql/query-builder";
import { getUser } from "@/lib/auth";

function authApi() {
  return {
    getUser: async () => {
      const user = await getUser();
      return { data: { user }, error: null };
    },
    getSession: async () => {
      const user = await getUser();
      return { data: { session: user ? { user } : null }, error: null };
    },
  };
}

// Async to preserve the previous `await createClient()` call signature.
export async function createClient() {
  return { ...createDbClient(), auth: authApi() };
}

// Previously the service-role (RLS-bypassing) client. With MySQL there is a
// single privileged connection; access control now lives in the app code.
export function createServiceClient() {
  return { ...createDbClient(), auth: authApi() };
}
