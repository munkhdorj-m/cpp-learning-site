-- =====================================================================
-- CPP Judge — database schema
-- Run this in Supabase SQL editor (Project → SQL Editor → New query)
-- =====================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =====================================================================
-- ENUMS
-- =====================================================================

create type user_role as enum ('student', 'teacher');
create type difficulty as enum ('easy', 'medium', 'hard');
create type verdict as enum (
  'pending',
  'judging',
  'accepted',
  'wrong_answer',
  'time_limit_exceeded',
  'memory_limit_exceeded',
  'runtime_error',
  'compile_error',
  'internal_error'
);

-- =====================================================================
-- CLASSES
-- =====================================================================

create table classes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,                          -- '7A', '8B', etc.
  grade smallint not null check (grade in (7, 8)),
  invite_code text not null unique,            -- e.g. '7A-X9F2QH'
  teacher_id uuid,                             -- FK added below (after profiles)
  created_at timestamptz not null default now()
);

create index on classes (teacher_id);

-- =====================================================================
-- PROFILES  (extends auth.users)
-- =====================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null unique check (char_length(username) between 3 and 20),
  display_name text not null,
  role user_role not null default 'student',
  class_id uuid references classes (id) on delete set null,
  xp integer not null default 0,
  level smallint not null default 1,
  problems_solved integer not null default 0,
  streak_days smallint not null default 0,
  last_solve_date date,
  avatar_seed text not null default gen_random_uuid()::text,
  preferred_locale text not null default 'mn' check (preferred_locale in ('mn', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on profiles (class_id);
create index on profiles (xp desc);

-- Add the deferred FK
alter table classes
  add constraint classes_teacher_id_fkey
  foreign key (teacher_id) references profiles (id) on delete set null;

-- =====================================================================
-- PROBLEMS
-- =====================================================================

create table problems (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title_mn text not null,
  title_en text,
  statement_mn text not null,                  -- markdown
  statement_en text,
  input_format_mn text,
  input_format_en text,
  output_format_mn text,
  output_format_en text,
  constraints_mn text,
  constraints_en text,
  difficulty difficulty not null default 'easy',
  time_limit_ms integer not null default 1000 check (time_limit_ms between 100 and 10000),
  memory_limit_kb integer not null default 65536 check (memory_limit_kb between 16384 and 524288),
  tags text[] not null default '{}',
  xp_reward integer not null default 10,
  is_public boolean not null default true,     -- false = visible only in assignment/contest
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on problems (is_public);
create index on problems (difficulty);

-- =====================================================================
-- TEST CASES
-- =====================================================================

create table test_cases (
  id uuid primary key default uuid_generate_v4(),
  problem_id uuid not null references problems (id) on delete cascade,
  stdin text not null,
  expected_stdout text not null,
  is_sample boolean not null default false,    -- samples are shown to students
  order_idx smallint not null default 0
);

create index on test_cases (problem_id, order_idx);

-- =====================================================================
-- SUBMISSIONS
-- =====================================================================

create table submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles (id) on delete cascade,
  problem_id uuid not null references problems (id) on delete cascade,
  code text not null,
  language text not null default 'cpp',
  verdict verdict not null default 'pending',
  runtime_ms integer,
  memory_kb integer,
  passed_tests smallint not null default 0,
  total_tests smallint not null default 0,
  failed_test_idx smallint,                    -- index of first failed test (null if AC)
  compile_output text,
  stderr_output text,
  judge_response jsonb,                        -- raw Judge0 payload, for debugging
  assignment_id uuid,                          -- FK added below
  contest_id uuid,                             -- FK added below
  is_first_accepted boolean not null default false,  -- true on first AC of this user+problem
  xp_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

create index on submissions (user_id, created_at desc);
create index on submissions (problem_id, user_id);
create index on submissions (verdict);

-- =====================================================================
-- ASSIGNMENTS  (per class)
-- =====================================================================

create table assignments (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid not null references classes (id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null default now(),
  due_at timestamptz not null,
  allow_late boolean not null default true,    -- accept submissions after due_at (penalised)
  late_penalty_pct smallint not null default 50 check (late_penalty_pct between 0 and 100),
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index on assignments (class_id, due_at);

create table assignment_problems (
  assignment_id uuid not null references assignments (id) on delete cascade,
  problem_id uuid not null references problems (id) on delete cascade,
  points integer not null default 100 check (points > 0),
  order_idx smallint not null default 0,
  primary key (assignment_id, problem_id)
);

alter table submissions
  add constraint submissions_assignment_id_fkey
  foreign key (assignment_id) references assignments (id) on delete set null;

-- =====================================================================
-- CONTESTS  (timed, optional per-class)
-- =====================================================================

create table contests (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  class_id uuid references classes (id) on delete cascade,  -- null = open
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_at > start_at)
);

create index on contests (class_id, start_at);

create table contest_problems (
  contest_id uuid not null references contests (id) on delete cascade,
  problem_id uuid not null references problems (id) on delete cascade,
  points integer not null default 100,
  order_idx smallint not null default 0,
  primary key (contest_id, problem_id)
);

alter table submissions
  add constraint submissions_contest_id_fkey
  foreign key (contest_id) references contests (id) on delete set null;

-- =====================================================================
-- BADGES + USER_BADGES
-- =====================================================================

create table badges (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,                   -- 'first_solve', '7_day_streak', etc.
  name_mn text not null,
  name_en text not null,
  description_mn text not null,
  description_en text not null,
  icon text not null,                          -- lucide icon name
  color text not null default 'amber',
  created_at timestamptz not null default now()
);

create table user_badges (
  user_id uuid not null references profiles (id) on delete cascade,
  badge_id uuid not null references badges (id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create index on user_badges (user_id);

-- =====================================================================
-- CODE SIMILARITY  (plagiarism detection)
-- =====================================================================

create table code_similarity (
  id uuid primary key default uuid_generate_v4(),
  submission_a_id uuid not null references submissions (id) on delete cascade,
  submission_b_id uuid not null references submissions (id) on delete cascade,
  problem_id uuid not null references problems (id) on delete cascade,
  similarity real not null check (similarity between 0 and 1),
  class_id uuid references classes (id) on delete set null,
  reviewed boolean not null default false,
  created_at timestamptz not null default now(),
  check (submission_a_id < submission_b_id)   -- canonical order, dedup pairs
);

create index on code_similarity (problem_id, similarity desc);
create index on code_similarity (class_id, reviewed);

-- =====================================================================
-- TRIGGERS
-- =====================================================================

-- Auto-update updated_at columns
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

create trigger problems_updated_at before update on problems
  for each row execute function set_updated_at();

-- Compute level from XP (simple curve: lvl = floor(sqrt(xp / 50)) + 1)
create or replace function compute_level(xp_total integer)
returns smallint as $$
begin
  return greatest(1, (floor(sqrt(xp_total::numeric / 50)) + 1)::smallint);
end;
$$ language plpgsql immutable;

-- When an accepted submission lands, award XP + update streak + flag first-AC
create or replace function on_submission_judged()
returns trigger as $$
declare
  v_already_solved boolean;
  v_streak smallint;
  v_last_date date;
  v_today date := (now() at time zone 'UTC')::date;
  v_xp_to_award integer;
begin
  -- Only run when transitioning to accepted
  if new.verdict <> 'accepted' then
    return new;
  end if;
  if tg_op = 'UPDATE' and old.verdict = 'accepted' then
    return new;  -- already-accepted, nothing to do
  end if;

  -- Has this user already solved this problem before?
  select exists(
    select 1 from submissions
    where user_id = new.user_id
      and problem_id = new.problem_id
      and id <> new.id
      and verdict = 'accepted'
  ) into v_already_solved;

  if not v_already_solved then
    new.is_first_accepted := true;
    select xp_reward into v_xp_to_award from problems where id = new.problem_id;
    new.xp_awarded := coalesce(v_xp_to_award, 10);

    -- Update streak
    select streak_days, last_solve_date into v_streak, v_last_date
      from profiles where id = new.user_id;

    if v_last_date is null or v_last_date < v_today - interval '1 day' then
      v_streak := 1;
    elsif v_last_date = v_today - interval '1 day' then
      v_streak := v_streak + 1;
    end if;
    -- if v_last_date = v_today, leave streak unchanged

    update profiles
       set xp = xp + new.xp_awarded,
           problems_solved = problems_solved + 1,
           streak_days = v_streak,
           last_solve_date = v_today,
           level = compute_level(xp + new.xp_awarded)
     where id = new.user_id;
  end if;

  return new;
end;
$$ language plpgsql;

-- SECURITY DEFINER lets the trigger bypass column-level grants on profiles
-- (students can't update XP directly, but this trigger needs to).
alter function on_submission_judged() security definer;

create trigger submissions_on_judged
  before insert or update of verdict on submissions
  for each row execute function on_submission_judged();

-- =====================================================================
-- ROW-LEVEL SECURITY
-- =====================================================================

alter table profiles          enable row level security;
alter table classes           enable row level security;
alter table problems          enable row level security;
alter table test_cases        enable row level security;
alter table submissions       enable row level security;
alter table assignments       enable row level security;
alter table assignment_problems enable row level security;
alter table contests          enable row level security;
alter table contest_problems  enable row level security;
alter table badges            enable row level security;
alter table user_badges       enable row level security;
alter table code_similarity   enable row level security;

-- Helper: is current user a teacher?
create or replace function is_teacher()
returns boolean as $$
  select exists(
    select 1 from profiles
    where id = auth.uid() and role = 'teacher'
  );
$$ language sql stable security definer;

-- ---------- profiles ----------
create policy "profiles readable by authenticated"
  on profiles for select
  to authenticated using (true);

create policy "profiles updatable by owner"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Column-level guard: students can only edit cosmetic fields directly.
-- XP/level/streak/etc are mutated by the on_submission_judged trigger
-- (which runs as SECURITY DEFINER and bypasses these grants).
revoke update on profiles from authenticated;
grant update (display_name, avatar_seed, preferred_locale) on profiles to authenticated;

-- Profile rows are created by the signup API route using the service role.
revoke insert on profiles from authenticated;

-- ---------- classes ----------
create policy "classes readable by authenticated"
  on classes for select
  to authenticated using (true);

create policy "classes writable by teachers"
  on classes for all
  to authenticated
  using (is_teacher()) with check (is_teacher());

-- ---------- problems ----------
create policy "public problems readable by anyone"
  on problems for select
  to authenticated
  using (
    is_public
    or is_teacher()
    or exists (
      select 1
      from assignment_problems ap
      join assignments a on a.id = ap.assignment_id
      join profiles p on p.class_id = a.class_id
      where ap.problem_id = problems.id
        and p.id = auth.uid()
        and a.start_at <= now()
    )
  );

create policy "problems writable by teachers"
  on problems for all
  to authenticated
  using (is_teacher()) with check (is_teacher());

-- ---------- test_cases ----------
create policy "sample tests visible to students"
  on test_cases for select
  to authenticated
  using (is_sample or is_teacher());

create policy "test_cases writable by teachers"
  on test_cases for all
  to authenticated
  using (is_teacher()) with check (is_teacher());

-- ---------- submissions ----------
create policy "students see own submissions"
  on submissions for select
  to authenticated
  using (
    user_id = auth.uid()
    or (
      is_teacher()
      and exists (
        select 1 from profiles s
        where s.id = submissions.user_id
          and s.class_id in (select id from classes where teacher_id = auth.uid())
      )
    )
  );

create policy "students insert own submissions"
  on submissions for insert
  to authenticated
  with check (user_id = auth.uid());

-- updates only via service role (judge worker); no policy = denied for clients

-- ---------- assignments ----------
create policy "assignments visible to class members"
  on assignments for select
  to authenticated
  using (
    class_id in (select class_id from profiles where id = auth.uid())
    or is_teacher()
  );

create policy "assignments writable by teachers"
  on assignments for all
  to authenticated
  using (is_teacher()) with check (is_teacher());

create policy "assignment_problems visible to class"
  on assignment_problems for select
  to authenticated
  using (
    exists (
      select 1 from assignments a
      where a.id = assignment_problems.assignment_id
        and (
          a.class_id in (select class_id from profiles where id = auth.uid())
          or is_teacher()
        )
    )
  );

create policy "assignment_problems writable by teachers"
  on assignment_problems for all
  to authenticated
  using (is_teacher()) with check (is_teacher());

-- ---------- contests ----------
create policy "contests visible by class or open"
  on contests for select
  to authenticated
  using (
    class_id is null
    or class_id in (select class_id from profiles where id = auth.uid())
    or is_teacher()
  );

create policy "contests writable by teachers"
  on contests for all
  to authenticated
  using (is_teacher()) with check (is_teacher());

create policy "contest_problems visible"
  on contest_problems for select
  to authenticated
  using (
    exists (
      select 1 from contests c
      where c.id = contest_problems.contest_id
        and (
          c.class_id is null
          or c.class_id in (select class_id from profiles where id = auth.uid())
          or is_teacher()
        )
    )
  );

create policy "contest_problems writable by teachers"
  on contest_problems for all
  to authenticated
  using (is_teacher()) with check (is_teacher());

-- ---------- badges + user_badges ----------
create policy "badges readable"
  on badges for select to authenticated using (true);

create policy "user_badges readable"
  on user_badges for select to authenticated using (true);

-- user_badges insert only via service role

-- ---------- code_similarity ----------
create policy "similarity readable by teachers"
  on code_similarity for select
  to authenticated
  using (is_teacher());

-- =====================================================================
-- SEED: initial badges
-- =====================================================================

insert into badges (code, name_mn, name_en, description_mn, description_en, icon, color) values
  ('first_solve',   'Анхны бодолт',     'First Solve',      'Эхний бодлогоо шийдсэн',                 'Solved your first problem',               'Sparkles', 'amber'),
  ('streak_7',      '7 хоног дараалан', '7-Day Streak',     '7 хоног дараалан бодлого шийдсэн',       '7 days in a row',                         'Flame',    'orange'),
  ('streak_30',     '30 хоног дараалан','30-Day Streak',    '30 хоног дараалан бодлого шийдсэн',      '30 days in a row',                        'Flame',    'red'),
  ('ten_solved',    '10 бодлого',       'Ten Solved',       '10 бодлого шийдсэн',                      'Solved 10 problems',                      'Trophy',   'amber'),
  ('fifty_solved',  '50 бодлого',       'Fifty Solved',     '50 бодлого шийдсэн',                      'Solved 50 problems',                      'Trophy',   'yellow'),
  ('hundred_solved','100 бодлого',      'Hundred Solved',   '100 бодлого шийдсэн',                     'Solved 100 problems',                     'Crown',    'yellow'),
  ('first_hard',    'Анхны хэцүү',      'First Hard',       'Эхний хэцүү бодлого шийдсэн',             'Solved your first Hard problem',          'Mountain', 'rose'),
  ('first_try',     'Нэг л оролдлогоор','First Try',        'Эхний илгээлтээр шийдсэн',                'Accepted on first submission',            'Target',   'emerald'),
  ('class_champion','Танхимын аварга',  'Class Champion',   '7 хоног танхимын тэргүүлэгч байсан',     'Top of class leaderboard for a week',     'Medal',    'violet')
on conflict (code) do nothing;
