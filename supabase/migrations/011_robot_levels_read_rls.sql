-- Fix RLS: allow ALL authenticated users to read robot_levels (students need
-- to see custom levels on the game page, not just teachers).

drop policy if exists "Teachers can read all levels" on robot_levels;
drop policy if exists "Anyone authenticated can read levels" on robot_levels;

create policy "Anyone authenticated can read levels"
  on robot_levels for select
  using (auth.uid() is not null);
