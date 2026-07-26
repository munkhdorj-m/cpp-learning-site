-- Adds explicit ordering to robot game levels.
-- Run ONCE in phpMyAdmin on the live database (orkhoncs_cppjudge),
-- and again on the dev copy if you use one.
--
-- Safe: only adds a column, no data is changed or removed.

ALTER TABLE robot_levels
  ADD COLUMN IF NOT EXISTS order_idx INT NOT NULL DEFAULT 0;

CREATE INDEX idx_robot_levels_order ON robot_levels (order_idx);
