-- Robot game custom levels for teacher dashboard
-- Run this in Supabase SQL editor

create table if not exists robot_levels (
  id text primary key,                    -- slug, e.g. "my-custom-maze"
  course text not null default 'basics',  -- basics | loops | conditionals | master
  name_mn text not null,
  name_en text not null,
  hint_mn text not null default '',
  hint_en text not null default '',
  width integer not null default 8,
  height integer not null default 8,
  layout jsonb not null default '[]',
  robot_x integer not null default 0,
  robot_y integer not null default 0,
  robot_dir integer not null default 0,   -- 0=N, 1=E, 2=S, 3=W
  targets jsonb not null default '[]',
  dangers jsonb not null default '[]',
  palette text[] not null default '{}',
  max_blocks integer not null default 10,
  xp_reward integer not null default 20,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS: only the creator can modify, teachers can read all
alter table robot_levels enable row level security;

drop policy if exists "Teachers can read all levels" on robot_levels;
create policy "Teachers can read all levels"
  on robot_levels for select
  using (exists (
    select 1 from profiles
    where profiles.id = auth.uid() and profiles.role = 'teacher'
  ));

drop policy if exists "Teacher can insert own levels" on robot_levels;
create policy "Teacher can insert own levels"
  on robot_levels for insert
  with check (
    created_by = auth.uid()
    and exists (
      select 1 from profiles
      where profiles.id = auth.uid() and profiles.role = 'teacher'
    )
  );

drop policy if exists "Teacher can update own levels" on robot_levels;
create policy "Teacher can update own levels"
  on robot_levels for update
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

drop policy if exists "Teacher can delete own levels" on robot_levels;
create policy "Teacher can delete own levels"
  on robot_levels for delete
  using (created_by = auth.uid());

-- Index
create index if not exists idx_robot_levels_course on robot_levels(course);
create index if not exists idx_robot_levels_created_by on robot_levels(created_by);