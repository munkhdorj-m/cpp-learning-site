-- "Turn in", for the assignment as a whole.
--
-- Until now a student could only hand in individual tasks, and only when the
-- teacher had added tasks to the assignment. An assignment made of problems,
-- or of nothing but a worksheet to read, had no way for a student to say "I am
-- done with this" — the progress bar filled by itself and that was the only
-- signal anyone got.
--
-- This is that signal, one row per student per assignment. It does not replace
-- the per-task hand-ins in task_submissions; it sits above them, the way
-- Google Classroom's Turn In sits above its attachments.
--
-- `late` is stamped at turn-in time rather than compared on read, because an
-- assignment's due date can be moved afterwards and a hand-in that was on time
-- when it was made should not become late because the teacher shifted the
-- deadline.
--
-- Safe to run more than once. No dependency on any other migration beyond the
-- base schema (assignments and profiles).

CREATE TABLE IF NOT EXISTS assignment_turnins (
  assignment_id CHAR(36)    NOT NULL,
  user_id       CHAR(36)    NOT NULL,
  turned_in_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  late          BOOLEAN     NOT NULL DEFAULT FALSE,
  PRIMARY KEY (assignment_id, user_id),
  KEY idx_ati_user (user_id, turned_in_at),
  CONSTRAINT fk_ati_assignment FOREIGN KEY (assignment_id)
    REFERENCES assignments (id) ON DELETE CASCADE,
  CONSTRAINT fk_ati_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
