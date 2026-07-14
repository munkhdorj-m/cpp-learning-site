-- Add progressive hints columns to robot_levels (optional JSON arrays).
-- Each entry is a coaching string revealed one at a time by the "Hint +" button.

alter table robot_levels
  add column if not exists hints_mn jsonb not null default '[]',
  add column if not exists hints_en jsonb not null default '[]';