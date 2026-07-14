-- Auto-award badges when a submission is accepted.
-- This function is called AFTER the on_submission_judged trigger updates
-- the profile (XP, streak, problems_solved).
--
-- Run this in Supabase SQL editor.

create or replace function award_badges_on_accept()
returns trigger as $$
declare
  v_user_id uuid := new.user_id;
  v_problems_solved int;
  v_streak int;
  v_is_first_try boolean;
  v_problem_difficulty text;
  v_total_submissions int;
  v_badge_id uuid;
begin
  -- Only on accepted verdicts
  if new.verdict <> 'accepted' then
    return new;
  end if;

  -- Gather stats
  select problems_solved, streak_days into v_problems_solved, v_streak
    from profiles where id = v_user_id;

  select difficulty into v_problem_difficulty
    from problems where id = new.problem_id;

  -- Check if this was a first-try (no prior submissions for this problem)
  select count(*) into v_total_submissions
    from submissions
    where user_id = v_user_id
      and problem_id = new.problem_id
      and id <> new.id;
  v_is_first_try := (v_total_submissions = 0);

  -- Award badges (idempotent — ON CONFLICT DO NOTHING)

  -- first_solve: first ever accepted
  if v_problems_solved >= 1 then
    select id into v_badge_id from badges where code = 'first_solve';
    if v_badge_id is not null then
      insert into user_badges (user_id, badge_id) values (v_user_id, v_badge_id)
        on conflict do nothing;
    end if;
  end if;

  -- ten_solved
  if v_problems_solved >= 10 then
    select id into v_badge_id from badges where code = 'ten_solved';
    if v_badge_id is not null then
      insert into user_badges (user_id, badge_id) values (v_user_id, v_badge_id)
        on conflict do nothing;
    end if;
  end if;

  -- fifty_solved
  if v_problems_solved >= 50 then
    select id into v_badge_id from badges where code = 'fifty_solved';
    if v_badge_id is not null then
      insert into user_badges (user_id, badge_id) values (v_user_id, v_badge_id)
        on conflict do nothing;
    end if;
  end if;

  -- hundred_solved
  if v_problems_solved >= 100 then
    select id into v_badge_id from badges where code = 'hundred_solved';
    if v_badge_id is not null then
      insert into user_badges (user_id, badge_id) values (v_user_id, v_badge_id)
        on conflict do nothing;
    end if;
  end if;

  -- streak_7
  if v_streak >= 7 then
    select id into v_badge_id from badges where code = 'streak_7';
    if v_badge_id is not null then
      insert into user_badges (user_id, badge_id) values (v_user_id, v_badge_id)
        on conflict do nothing;
    end if;
  end if;

  -- streak_30
  if v_streak >= 30 then
    select id into v_badge_id from badges where code = 'streak_30';
    if v_badge_id is not null then
      insert into user_badges (user_id, badge_id) values (v_user_id, v_badge_id)
        on conflict do nothing;
    end if;
  end if;

  -- first_hard
  if v_problem_difficulty = 'hard' then
    select id into v_badge_id from badges where code = 'first_hard';
    if v_badge_id is not null then
      insert into user_badges (user_id, badge_id) values (v_user_id, v_badge_id)
        on conflict do nothing;
    end if;
  end if;

  -- first_try
  if v_is_first_try then
    select id into v_badge_id from badges where code = 'first_try';
    if v_badge_id is not null then
      insert into user_badges (user_id, badge_id) values (v_user_id, v_badge_id)
        on conflict do nothing;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Drop old trigger if exists, create new one
drop trigger if exists submissions_award_badges on submissions;
create trigger submissions_award_badges
  after insert or update of verdict on submissions
  for each row execute function award_badges_on_accept();