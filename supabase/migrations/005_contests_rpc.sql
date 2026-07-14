-- =====================================================================
-- Migration: contest_leaderboard() RPC. Sums points per student for AC
-- submissions made during the contest window. Only counts first-AC so
-- re-submitting the same problem doesn't game it.
-- =====================================================================

create or replace function contest_leaderboard(contest_id_in uuid)
returns table (
  user_id uuid,
  display_name text,
  username text,
  class_name text,
  score bigint,
  problems_solved int
)
language sql
security definer
as $$
  with c as (
    select id, start_at, end_at, class_id
    from contests
    where id = contest_id_in
  ),
  cps as (
    select problem_id, points
    from contest_problems
    where contest_id = contest_id_in
  ),
  acs as (
    select s.user_id, s.problem_id, cps.points
    from submissions s
    join cps on cps.problem_id = s.problem_id
    cross join c
    where s.verdict = 'accepted'
      and s.is_first_accepted = true
      and s.created_at >= c.start_at
      and s.created_at <= c.end_at
  )
  select
    p.id,
    p.display_name,
    p.username,
    cl.name,
    coalesce(sum(acs.points), 0)::bigint as score,
    count(acs.problem_id)::int as problems_solved
  from profiles p
  cross join c
  left join acs on acs.user_id = p.id
  left join classes cl on cl.id = p.class_id
  where p.role = 'student'
    and (c.class_id is null or p.class_id = c.class_id)
  group by p.id, p.display_name, p.username, cl.name
  having count(acs.problem_id) > 0
  order by score desc, problems_solved desc, p.display_name asc;
$$;

grant execute on function contest_leaderboard(uuid) to authenticated;
