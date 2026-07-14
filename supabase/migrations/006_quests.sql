-- =====================================================================
-- Migration: daily Quest system (mini-games that award XP)
-- Tables: quests, user_quest_attempts
-- Trigger: on_quest_attempt — awards XP + bumps profile.xp/level on correct answer
-- =====================================================================

create type quest_type as enum ('predict_output', 'bug_hunt', 'multiple_choice');

create table quests (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  type quest_type not null,
  prompt_mn text not null,
  prompt_en text,
  code_snippet text,
  choices_mn jsonb,          -- array of strings for MC / bug_hunt
  choices_en jsonb,
  correct_answer text not null,    -- exact string for predict_output, "0"-"N" index for MC
  explanation_mn text,
  explanation_en text,
  difficulty difficulty not null default 'easy',
  xp_reward smallint not null default 5 check (xp_reward between 1 and 100),
  tags text[] not null default '{}',
  is_active boolean not null default true,
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on quests (type, is_active);
create index on quests (difficulty);

create trigger quests_updated_at before update on quests
  for each row execute function set_updated_at();

create table user_quest_attempts (
  user_id uuid not null references profiles (id) on delete cascade,
  quest_id uuid not null references quests (id) on delete cascade,
  was_correct boolean not null,
  user_answer text,
  xp_awarded smallint not null default 0,
  answered_at timestamptz not null default now(),
  primary key (user_id, quest_id)
);

create index on user_quest_attempts (user_id, answered_at desc);

-- RLS
alter table quests enable row level security;
alter table user_quest_attempts enable row level security;

create policy "quests readable by authenticated"
  on quests for select to authenticated using (is_active or is_teacher());

create policy "quests writable by teachers"
  on quests for all to authenticated using (is_teacher()) with check (is_teacher());

-- Hide the answer and explanation columns from non-teacher reads.
-- The /api/quests/answer route uses the service role so it still has access.
revoke select on quests from authenticated;
grant select (
  id, slug, type, prompt_mn, prompt_en, code_snippet,
  choices_mn, choices_en, difficulty, xp_reward, tags, is_active,
  created_by, created_at, updated_at
) on quests to authenticated;

create policy "own attempts readable"
  on user_quest_attempts for select to authenticated
  using (user_id = auth.uid() or is_teacher());

create policy "own attempts insertable"
  on user_quest_attempts for insert to authenticated
  with check (user_id = auth.uid());

-- Award XP when a correct attempt is recorded.
-- SECURITY DEFINER so it can bypass column-level grants on profiles.
create or replace function on_quest_attempt()
returns trigger as $$
begin
  if new.was_correct and new.xp_awarded > 0 then
    update profiles
       set xp = xp + new.xp_awarded,
           level = compute_level(xp + new.xp_awarded)
     where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

alter function on_quest_attempt() security definer;

create trigger quest_attempt_xp
  after insert on user_quest_attempts
  for each row execute function on_quest_attempt();

-- New badges
insert into badges (code, name_mn, name_en, description_mn, description_en, icon, color) values
  ('quest_10',          '10 даалгавар',  'Ten Quests',     '10 даалгавар амжилттай гүйцэтгэсэн',  'Completed 10 quests',                       'Target', 'violet'),
  ('quest_50',          '50 даалгавар',  'Fifty Quests',   '50 даалгавар амжилттай гүйцэтгэсэн',  'Completed 50 quests',                       'Target', 'amber'),
  ('quest_perfect_day', 'Төгс өдөр',     'Perfect Day',    'Өдрийн бүх даалгаврыг алдаагүй',      'All daily quests correct, no mistakes',     'Sparkles', 'yellow')
on conflict (code) do nothing;
