-- Progress tracking: what each student has read, answered and needs to review.
--
-- Until now, "I understand this" on a lesson and every quiz answer lived in the
-- student's own browser and was thrown away. That made two things impossible:
-- showing a student what to do next, and showing a teacher what the class has
-- not understood.
--
-- Run once:  mysql -u USER -p DBNAME < migration/add-progress-tracking.sql

-- ---------- content_progress ----------
-- One row per piece of reading a student has marked as done. Covers both the
-- Learn lessons and the Cambridge topics, which behave identically.
CREATE TABLE IF NOT EXISTS content_progress (
  user_id CHAR(36)                   NOT NULL,
  kind    ENUM('lesson','cambridge') NOT NULL,
  slug    VARCHAR(96)                NOT NULL,
  done_at DATETIME(6)                NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, kind, slug),
  KEY idx_cp_user (user_id),
  KEY idx_cp_item (kind, slug),
  CONSTRAINT fk_cp_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- quiz_answers ----------
-- Every answer, not just the latest, because the question a teacher wants
-- answered is "how did the class do on this", and that needs the history.
--
-- item_key identifies one question: "lesson:variables#0" or
-- "cambridge:igcse/number-systems#2". Reordering the questions in a quiz
-- re-keys them, which is fine — old rows simply stop matching.
CREATE TABLE IF NOT EXISTS quiz_answers (
  id         CHAR(36)     NOT NULL,
  user_id    CHAR(36)     NOT NULL,
  item_key   VARCHAR(160) NOT NULL,
  choice     SMALLINT     NOT NULL,
  correct    BOOLEAN      NOT NULL,
  created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_qa_user_time (user_id, created_at),
  KEY idx_qa_item (item_key),
  CONSTRAINT fk_qa_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- review_items ----------
-- The spaced-repetition schedule: one row per student per question they have
-- met. A wrong answer comes back tomorrow; each correct one pushes it further
-- away. Only the current state lives here — the history is in quiz_answers.
CREATE TABLE IF NOT EXISTS review_items (
  user_id       CHAR(36)     NOT NULL,
  item_key      VARCHAR(160) NOT NULL,
  due_on        DATE         NOT NULL,
  interval_days SMALLINT     NOT NULL DEFAULT 1,
  streak        SMALLINT     NOT NULL DEFAULT 0,
  lapses        SMALLINT     NOT NULL DEFAULT 0,
  last_seen     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, item_key),
  KEY idx_ri_due (user_id, due_on),
  CONSTRAINT fk_ri_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
