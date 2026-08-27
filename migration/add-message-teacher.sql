-- A message thread has two ends: one student and one teacher.
--
-- The first version had no teacher on the thread at all — every teacher saw
-- every student's questions. That was a deliberate choice at the time, because
-- classes.teacher_id is nullable and mostly unset here, so routing "to the
-- teacher of this student's class" would have routed most threads to nobody.
-- The answer is to let the student pick instead.
--
-- teacher_id is NULLABLE on purpose, for two cases:
--
--   * threads created before this migration, which have no teacher recorded
--   * a teacher account that is later deleted (ON DELETE SET NULL)
--
-- A thread with no teacher falls back to the old behaviour — any teacher can
-- read and answer it — so nothing becomes unanswerable. See mayReadThread in
-- lib/messages.ts, which is where that rule lives.
--
-- ---------------------------------------------------------------------------
-- WHY THIS LOOKS LIKE THIS
--
-- The obvious `ALTER TABLE … ADD COLUMN IF NOT EXISTS` is MariaDB syntax.
-- This server is MySQL 8.0, which rejects it outright with a parse error — so
-- the first version of this file did nothing at all, silently, and the column
-- never appeared. MySQL has no IF NOT EXISTS for columns, indexes or foreign
-- keys, so each step asks information_schema first and prepares the statement
-- only if it is needed. Verbose, but it runs on MySQL and is safe to re-run.
-- ---------------------------------------------------------------------------
--
-- Safe to run more than once. Run add-messages.sql first if you have not.

-- ---------- the column ----------
SET @has_col := (
  SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'message_threads'
     AND column_name = 'teacher_id'
);
SET @sql := IF(@has_col = 0,
  'ALTER TABLE message_threads ADD COLUMN teacher_id CHAR(36) NULL AFTER student_id',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------- the index a teacher's inbox reads ----------
SET @has_idx := (
  SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE()
     AND table_name = 'message_threads'
     AND index_name = 'idx_mt_teacher'
);
SET @sql := IF(@has_idx = 0,
  'CREATE INDEX idx_mt_teacher ON message_threads (teacher_id, last_message_at)',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------- the foreign key ----------
-- SET NULL, not CASCADE: a teacher leaving must not delete the students'
-- questions along with their account.
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.table_constraints
   WHERE table_schema = DATABASE()
     AND table_name = 'message_threads'
     AND constraint_name = 'fk_mt_teacher'
);
SET @sql := IF(@has_fk = 0,
  'ALTER TABLE message_threads ADD CONSTRAINT fk_mt_teacher FOREIGN KEY (teacher_id) REFERENCES profiles (id) ON DELETE SET NULL',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
