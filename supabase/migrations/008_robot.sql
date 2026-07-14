-- =====================================================================
-- Migration: Robot Programmer puzzle game
-- robot_progress tracks one row per (user, level) the first time it's solved.
-- XP is awarded exactly once per level via the after-insert trigger.
-- =====================================================================

create table robot_progress (
  user_id uuid not null references profiles (id) on delete cascade,
  level_id text not null,
  xp_awarded smallint not null default 0 check (xp_awarded between 0 and 100),
  instruction_count smallint not null default 0,
  completed_at timestamptz not null default now(),
  primary key (user_id, level_id)
);

create index on robot_progress (user_id, completed_at desc);

alter table robot_progress enable row level security;

create policy "own robot progress readable"
  on robot_progress for select to authenticated
  using (user_id = auth.uid() or is_teacher());

-- Inserts via service role only (/api/robot/complete). No public insert.

create or replace function on_robot_progress()
returns trigger as $$
begin
  if new.xp_awarded > 0 then
    update profiles
       set xp = xp + new.xp_awarded,
           level = compute_level(xp + new.xp_awarded)
     where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

alter function on_robot_progress() security definer;

create trigger robot_progress_xp
  after insert on robot_progress
  for each row execute function on_robot_progress();

-- New badges
insert into badges (code, name_mn, name_en, description_mn, description_en, icon, color) values
  ('robot_3',     'Эхний 3 түвшин',    'Robot Apprentice', 'Robot Programmer-ийн 3 түвшинг шийдсэн',  'Solved 3 robot levels',  'Target',   'violet'),
  ('robot_all',   'Бүх түвшин',        'Robot Master',     'Robot Programmer-ийн бүх түвшинг шийдсэн', 'Solved every robot level', 'Crown',    'amber'),
  ('robot_short', 'Богино шийдэл',     'Short Solution',   '5-аас цөөн зааврар түвшин шийдсэн',       'Solved a level in 5 instructions or fewer', 'Sparkles', 'emerald')
on conflict (code) do nothing;
