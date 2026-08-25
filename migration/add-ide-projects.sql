-- Saved sandbox work.
--
-- `submissions` already stores code, but every row is bound to a problem_id,
-- so there was nowhere for a student to keep something they simply wrote in
-- the IDE. Every visit to /ide started from the starter template and last
-- week's work was gone.
--
-- One row = one file, which is what the judge actually compiles. Deliberately
-- not a file tree: the runner takes a single file, so extra files could be
-- organised but never run, which would be a lie about what the tool does.

CREATE TABLE IF NOT EXISTS ide_projects (
  id         CHAR(36)    NOT NULL,
  user_id    CHAR(36)    NOT NULL,
  name       VARCHAR(80) NOT NULL,
  language   VARCHAR(16) NOT NULL DEFAULT 'cpp',
  code       MEDIUMTEXT  NOT NULL,
  stdin      MEDIUMTEXT  NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
               ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  -- The only read path is "this student's files, newest first".
  KEY idx_ide_user_updated (user_id, updated_at DESC),
  CONSTRAINT fk_ide_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
