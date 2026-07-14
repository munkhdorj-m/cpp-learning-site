import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/get-session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    // Fast path: reads x-user-id from middleware header (no Supabase call).
    // Slow path (fallback): calls supabase.auth.getUser() if header missing.
    user = await getCachedSession();
  } catch {
    // Supabase unreachable — allow access, let individual pages handle the error
  }

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
