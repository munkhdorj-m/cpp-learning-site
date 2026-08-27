-- Adds explicit ordering to robot game levels.
-- Run ONCE in phpMyAdmin on the live database (orkhoncs_cppjudge),
-- and again on the dev copy if you use one.
--
-- Safe: only adds a column and an index, no data is changed or removed.
--
-- NOTE: this used to say `ADD COLUMN IF NOT EXISTS`, which is MariaDB syntax.
-- This server is MySQL 8.0 and rejects it with a parse error, so the file did
-- nothing at all — silently. MySQL has no IF NOT EXISTS for columns or
-- indexes, so each step asks information_schema first. Safe to re-run.

SET @has_col := (
  SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = DATABASE()
     AND table_name = 'robot_levels'
     AND column_name = 'order_idx'
);
SET @sql := IF(@has_col = 0,
  'ALTER TABLE robot_levels ADD COLUMN order_idx INT NOT NULL DEFAULT 0',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @has_idx := (
  SELECT COUNT(*) FROM information_schema.statistics
   WHERE table_schema = DATABASE()
     AND table_name = 'robot_levels'
     AND index_name = 'idx_robot_levels_order'
);
SET @sql := IF(@has_idx = 0,
  'CREATE INDEX idx_robot_levels_order ON robot_levels (order_idx)',
  'DO 0');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
