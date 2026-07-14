import { NextResponse, type NextRequest } from "next/server";

import { createServerClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getSession() is safe here because middleware only uses it to refresh
  // expired cookies — it never passes the unverified user object to route
  // handlers or server components. Auth verification is done by getUser()
  // in getCachedSession().
  try {
    await supabase.auth.getSession();
  } catch {
    // Supabase unreachable — continue without a session
  }

  return response;
}
