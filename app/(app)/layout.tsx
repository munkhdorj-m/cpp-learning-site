/**
 * No gate here any more.
 *
 * This layout used to call getCachedSession() and redirect("/login") when it
 * came back empty, which put every lesson, every problem and every game behind
 * an account. A visitor could not see a single thing the site teaches before
 * being asked to log in.
 *
 * Reading is now open; only acting needs an account. The pages that still
 * require one call requireAuth() themselves — see lib/auth-helpers.ts. They
 * are the ones that are meaningless signed out (profile, today, quests,
 * assignments) or that would show one student's data to a stranger
 * (leaderboard, contests). Teacher pages keep their own requireTeacher().
 *
 * Dropping the session read here has a second effect worth knowing: it was
 * calling headers(), which opted this entire subtree out of static rendering.
 * The lesson and syllabus pages can now actually be prerendered.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
