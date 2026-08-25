-- Assignments that can carry materials and work the judge cannot mark.
--
-- Until now an assignment was a title, two dates and a list of judge problems.
-- That covers "solve these five problems" and nothing else — no worksheet, no
-- reading, no "write this in Python and hand it in", which is most of what a
-- teacher actually sets.
--
-- Four tables:
--   uploads              every stored file, wherever it came from
--   assignment_materials what the teacher attaches for students to read
--   assignment_tasks     a piece of work with no automatic marking
--   task_submissions     one student's hand-in for one task, and its mark
--
-- Judge problems are untouched: assignment_problems still works exactly as it
-- did, and an assignment can mix both kinds freely.
--
-- RUN add-ide-projects.sql FIRST. task_submissions references ide_projects,
-- so applying this to a database that has not had that migration fails with
-- "Failed to open the referenced table 'ide_projects'".

-- ---------- uploads ----------
--
-- The row is the record; the bytes live on disk under UPLOAD_DIR, named by
-- `stored_name`. Nothing is ever served straight from public/ — see
-- app/api/uploads/[id]/route.ts for why an assignment PDF must not be
-- readable by anyone who guesses a URL.
CREATE TABLE IF NOT EXISTS uploads (
  id            CHAR(36)     NOT NULL,
  -- Kept when the uploader is deleted: the file may still be attached to an
  -- assignment that other people still need.
  owner_id      CHAR(36)     NULL,
  original_name VARCHAR(255) NOT NULL,
  mime          VARCHAR(127) NOT NULL,
  bytes         INT UNSIGNED NOT NULL,
  -- Generated, never the name the browser sent. See lib/uploads.ts.
  stored_name   VARCHAR(96)  NOT NULL,
  created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_uploads_stored (stored_name),
  KEY idx_uploads_owner (owner_id, created_at),
  CONSTRAINT fk_uploads_owner FOREIGN KEY (owner_id)
    REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- materials ----------
CREATE TABLE IF NOT EXISTS assignment_materials (
  id            CHAR(36)     NOT NULL,
  assignment_id CHAR(36)     NOT NULL,
  -- 'link' uses url; 'file' uses upload_id.
  kind          ENUM('link', 'file') NOT NULL,
  title         VARCHAR(255) NOT NULL,
  url           VARCHAR(2048) NULL,
  upload_id     CHAR(36)     NULL,
  order_idx     SMALLINT     NOT NULL DEFAULT 0,
  created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_am_assignment (assignment_id, order_idx),
  CONSTRAINT fk_am_assignment FOREIGN KEY (assignment_id)
    REFERENCES assignments (id) ON DELETE CASCADE,
  -- Removing the file removes the material: a material pointing at nothing is
  -- a broken link on a student's page.
  CONSTRAINT fk_am_upload FOREIGN KEY (upload_id)
    REFERENCES uploads (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- tasks ----------
--
-- Separate booleans rather than a SET column: the query builder in
-- lib/mysql/query-builder.ts has no SET support, and four flags read more
-- clearly in the form anyway.
CREATE TABLE IF NOT EXISTS assignment_tasks (
  id            CHAR(36)     NOT NULL,
  assignment_id CHAR(36)     NOT NULL,
  title         VARCHAR(255) NOT NULL,
  instructions  TEXT         NULL,
  points        INT          NOT NULL DEFAULT 100,
  accept_file   BOOLEAN      NOT NULL DEFAULT TRUE,
  accept_link   BOOLEAN      NOT NULL DEFAULT TRUE,
  accept_text   BOOLEAN      NOT NULL DEFAULT TRUE,
  accept_ide    BOOLEAN      NOT NULL DEFAULT FALSE,
  -- Where the starter code came from, and a copy of it. Fetched once when the
  -- teacher sets the task: handing each student a copy from OUR copy means a
  -- class of thirty costs GitHub exactly one request, not thirty.
  starter_repo  VARCHAR(500) NULL,
  starter_files MEDIUMTEXT   NULL,
  order_idx     SMALLINT     NOT NULL DEFAULT 0,
  created_at    DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_at_assignment (assignment_id, order_idx),
  CONSTRAINT chk_at_points CHECK (points > 0),
  CONSTRAINT fk_at_assignment FOREIGN KEY (assignment_id)
    REFERENCES assignments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- hand-ins ----------
--
-- One row per student per task, replaced when they hand in again, so the
-- teacher always marks the current version rather than a pile of drafts.
CREATE TABLE IF NOT EXISTS task_submissions (
  id             CHAR(36)    NOT NULL,
  task_id        CHAR(36)    NOT NULL,
  user_id        CHAR(36)    NOT NULL,
  -- Whichever of these the task accepts and the student used.
  note           TEXT        NULL,
  link           VARCHAR(2048) NULL,
  upload_id      CHAR(36)    NULL,
  ide_project_id CHAR(36)    NULL,
  submitted_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at     DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                   ON UPDATE CURRENT_TIMESTAMP(6),
  -- Marking. NULL score means "handed in, not looked at yet".
  score          INT         NULL,
  feedback       TEXT        NULL,
  marked_by      CHAR(36)    NULL,
  marked_at      DATETIME(6) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ts_task_user (task_id, user_id),
  KEY idx_ts_task (task_id, submitted_at),
  KEY idx_ts_user (user_id, submitted_at),
  CONSTRAINT fk_ts_task FOREIGN KEY (task_id)
    REFERENCES assignment_tasks (id) ON DELETE CASCADE,
  CONSTRAINT fk_ts_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE,
  -- The hand-in survives the file being removed; the row still records that
  -- the student handed something in, and when.
  CONSTRAINT fk_ts_upload FOREIGN KEY (upload_id)
    REFERENCES uploads (id) ON DELETE SET NULL,
  CONSTRAINT fk_ts_project FOREIGN KEY (ide_project_id)
    REFERENCES ide_projects (id) ON DELETE SET NULL,
  CONSTRAINT fk_ts_marker FOREIGN KEY (marked_by)
    REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
