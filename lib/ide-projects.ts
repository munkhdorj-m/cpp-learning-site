// Limits for saved sandbox files, in one place because three callers need
// them: both API routes enforce them, and the IDE shows the count so a
// student sees the cap coming instead of meeting it as an error.

/**
 * Five files each. Small on purpose: it keeps the sidebar readable, keeps a
 * class of thirty well inside the shared hosting's disk, and pushes students
 * to tidy up rather than accumulate forty copies of "test2".
 */
export const MAX_IDE_PROJECTS = 5;

/** Far above any real grade 7-8 program, far below what would hurt the DB. */
export const MAX_IDE_CODE = 100_000;
