-- =====================================================================
-- Migration: Bug Smash 3D — daily game with XP rewards
-- Tables: game_attempts (one row per user per day with the best score)
-- Awards XP via trigger; cap is enforced server-side in the API route.
-- =====================================================================

create table game_attempts (
  user_id uuid not null references profiles (id) on delete cascade,
  day date not null,
  score integer not null default 0 check (score >= 0),
  xp_awarded integer not null default 0 check (xp_awarded >= 0),
  plays smallint not null default 1,
  best_combo smallint not null default 0,
  played_at timestamptz not null default now(),
  primary key (user_id, day)
);

create index on game_attempts (played_at desc);
create index on game_attempts (score desc);

alter table game_attempts enable row level security;

create policy "own game attempts readable"
  on game_attempts for select to authenticated
  using (user_id = auth.uid() or is_teacher());

-- Inserts/updates go through the service role in /api/game/submit-score
-- (no client-side write policy intentionally).

-- Award XP on insert OR when the score improves on an update.
create or replace function on_game_attempt()
returns trigger as $$
declare
  v_delta int := 0;
begin
  if tg_op = 'INSERT' then
    v_delta := new.xp_awarded;
  elsif tg_op = 'UPDATE' then
    v_delta := new.xp_awarded - old.xp_awarded;
  end if;
  if v_delta > 0 then
    update profiles
       set xp = xp + v_delta,
           level = compute_level(xp + v_delta)
     where id = new.user_id;
  end if;
  return new;
end;
$$ language plpgsql;

alter function on_game_attempt() security definer;

create trigger game_attempt_xp
  after insert or update on game_attempts
  for each row execute function on_game_attempt();

-- New badges
insert into badges (code, name_mn, name_en, description_mn, description_en, icon, color) values
  ('first_smash',  'Анхны цохилт',  'First Smash',     'Анхны Bug Smash тоглолтоо тоглосон',  'Played your first Bug Smash game',  'Target',  'violet'),
  ('smash_100',    '100 цохилт',    'Smash Master',    'Bug Smash тоглоомд 100+ XP цуглуулсан', 'Earned 100+ XP from Bug Smash',     'Trophy',  'amber'),
  ('smash_combo',  'Дөрвөн дараалан', 'Combo Master',  'Bug Smash тоглоомд 10+ дараалан цохисон', '10+ smash combo in Bug Smash',    'Sparkles', 'rose')
on conflict (code) do nothing;
