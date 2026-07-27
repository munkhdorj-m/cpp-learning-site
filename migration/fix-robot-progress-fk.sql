-- FIX: completing a built-in robot level failed with
--   "Cannot add or update a child row: a foreign key constraint fails
--    (robot_progress, CONSTRAINT fk_rp_level ...)"
--
-- Cause: robot_progress.level_id had a foreign key to robot_levels.id, but
-- the 26 built-in levels live only in the app code — they have no row in
-- robot_levels. So no built-in level could ever be recorded as completed,
-- and no XP was awarded for them. The original Postgres schema had no such
-- foreign key; it was introduced by mistake during the MySQL migration.
--
-- Run ONCE in phpMyAdmin on orkhoncs_cppjudge (and the dev copy if you use one).
-- Safe: drops only the constraint. No data is changed or removed.

ALTER TABLE robot_progress DROP FOREIGN KEY fk_rp_level;
