  -- Let a teacher take a robot level out of the game.
  --
  -- The 26 starting levels are not database rows — they are a constant in
  -- app/(app)/game/robot/levels.ts. That is why the delete button never appeared
  -- next to them: there was nothing to delete. The only rows in robot_levels are
  -- ones a teacher created, or an "override" the editor wrote when a teacher
  -- edited a built-in.
  --
  -- So "removed" is recorded here instead of in robot_levels. A row in this
  -- table means "do not show this level id to students", whatever kind of level
  -- it is, and removing the row puts it back. That works uniformly for a
  -- built-in, for an override, and for a custom level, and it needs none of
  -- robot_levels' NOT NULL columns — which a built-in has no values for, since
  -- its layout lives in code as parsed geometry rather than as the raw strings
  -- the table stores.
  --
  -- Safe to run more than once.

  CREATE TABLE IF NOT EXISTS robot_hidden_levels (
    level_id  VARCHAR(64) NOT NULL,
    hidden_by CHAR(36)    NULL,
    hidden_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (level_id),
    -- Deliberately NO foreign key to robot_levels: most hidden ids will be
    -- built-ins, which have no row there. Same reasoning as robot_progress —
    -- see the note in migration/fix-robot-progress-fk.sql.
    CONSTRAINT fk_rhl_by FOREIGN KEY (hidden_by)
      REFERENCES profiles (id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
