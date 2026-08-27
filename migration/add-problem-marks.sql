-- Let a teacher overrule what the judge gave.
--
-- A coding problem marks itself: the judge accepts it and the student gets the
-- points the teacher set for it. That is right almost always, and wrong in the
-- one case that matters — work that was copied, or produced by an AI. Until
-- now a teacher who spotted that had nothing to do about it: the points were
-- automatic and final.
--
-- A row here replaces the automatic points for one student, on one problem, in
-- one assignment. No row means the automatic points stand, so this table stays
-- empty except for the handful of cases a teacher has actually looked at.
--
-- `points` may legitimately be 0 (work that will not be credited) or higher
-- than the problem is worth (a teacher giving credit for a good attempt), so
-- there is no CHECK beyond it being a number. It is bounded in app code.
--
-- Safe to run more than once.

CREATE TABLE IF NOT EXISTS assignment_problem_marks (
  assignment_id CHAR(36)     NOT NULL,
  user_id       CHAR(36)     NOT NULL,
  problem_id    CHAR(36)     NOT NULL,
  points        INT          NOT NULL,
  -- Why the teacher changed it. Shown to the student, so they know a person
  -- decided this and can ask about it.
  note          VARCHAR(500) NULL,
  marked_by     CHAR(36)     NULL,
  marked_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (assignment_id, user_id, problem_id),
  KEY idx_apm_user (user_id, assignment_id),
  CONSTRAINT fk_apm_assignment FOREIGN KEY (assignment_id)
    REFERENCES assignments (id) ON DELETE CASCADE,
  CONSTRAINT fk_apm_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_apm_problem FOREIGN KEY (problem_id)
    REFERENCES problems (id) ON DELETE CASCADE,
  -- The mark outlives the teacher's account; it just stops saying who made it.
  CONSTRAINT fk_apm_marker FOREIGN KEY (marked_by)
    REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
