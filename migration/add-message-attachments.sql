-- A message can carry a picture or a file.
--
-- A student stuck on something photographs their screen or their exercise
-- book; a teacher sends back a worksheet. Typing "I get an error" is a much
-- worse question than showing the error.
--
-- Reuses the existing uploads table rather than inventing another one, so the
-- size limit, the allowed types, the generated storage names and the
-- authenticated download route all apply here unchanged (lib/uploads.ts).
--
-- ON DELETE SET NULL: the message survives its attachment being removed. What
-- someone said and when is worth keeping even after the file is gone.
--
-- Written the long way round because this server is MySQL 8.0, which has no
-- ADD COLUMN IF NOT EXISTS — that is MariaDB, and a file using it does nothing
-- at all here. See add-message-teacher.sql, which learned that the hard way.
--
-- Safe to run more than once. Run add-messages.sql first if you have not.

-- ---------- the column ----------
SET @has_col := (
  SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'messages'
     AND column_name = 'upload_id'
);
SET @sql := IF(@has_col = 0,
  'ALTER TABLE messages ADD COLUMN upload_id CHAR(36) NULL AFTER body',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------- the foreign key ----------
SET @has_fk := (
  SELECT COUNT(*) FROM information_schema.table_constraints
   WHERE table_schema = DATABASE()
     AND table_name = 'messages'
     AND constraint_name = 'fk_msg_upload'
);
SET @sql := IF(@has_fk = 0,
  'ALTER TABLE messages ADD CONSTRAINT fk_msg_upload FOREIGN KEY (upload_id) REFERENCES uploads (id) ON DELETE SET NULL',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
