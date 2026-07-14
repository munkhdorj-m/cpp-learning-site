-- =====================================================================
-- Migration: hook up automatic badge awarding to submission acceptance.
-- Paste this in Supabase SQL Editor → New query → Run.
-- Idempotent (uses ON CONFLICT).
-- =====================================================================

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
    return new;
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

    update profiles
       set xp = xp + new.xp_awarded,
           problems_solved = problems_solved + 1,
           streak_days = v_streak,
           last_solve_date = v_today,
           level = compute_level(xp + new.xp_awarded)
     where id = new.user_id;

    -- Award badges (idempotent — ON CONFLICT skips already-earned)
    insert into user_badges (user_id, badge_id)
    select new.user_id, b.id
    from badges b,
         (select problems_solved, streak_days from profiles where id = new.user_id) p,
         (select difficulty from problems where id = new.problem_id) pr
    where (
      (b.code = 'first_solve'    and p.problems_solved = 1) or
      (b.code = 'ten_solved'     and p.problems_solved = 10) or
      (b.code = 'fifty_solved'   and p.problems_solved = 50) or
      (b.code = 'hundred_solved' and p.problems_solved = 100) or
      (b.code = 'streak_7'       and p.streak_days = 7) or
      (b.code = 'streak_30'      and p.streak_days = 30) or
      (b.code = 'first_hard'     and pr.difficulty = 'hard' and not exists(
         select 1 from submissions s
         join problems pp on pp.id = s.problem_id
         where s.user_id = new.user_id
           and s.verdict = 'accepted'
           and pp.difficulty = 'hard'
           and s.id <> new.id
      )) or
      (b.code = 'first_try'      and not exists(
         select 1 from submissions s
         where s.user_id = new.user_id
           and s.problem_id = new.problem_id
           and s.id <> new.id
      ))
    )
    on conflict (user_id, badge_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql;

-- Re-apply SECURITY DEFINER so the trigger can bypass column-level grants
alter function on_submission_judged() security definer;
