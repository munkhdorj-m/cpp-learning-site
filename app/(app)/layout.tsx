import { redirect } from "next/navigation";

import { getCachedSession } from "@/lib/get-session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  try {
    // getCachedSession() now reads x-user-id from middleware header (fast path)
    // instead of making a network call on every navigation
    user = await getCachedSession();
  } catch {
    // Supabase unreachable — allow access, let individual pages handle the error
  }

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
