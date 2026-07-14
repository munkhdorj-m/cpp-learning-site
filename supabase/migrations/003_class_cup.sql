-- =====================================================================
-- Migration: class_week_xp() RPC for the class-vs-class cup section.
-- Sums XP earned this week per class (only counting first-AC submissions
-- so re-submitting an already-solved problem doesn't game it).
-- =====================================================================

create or replace function class_week_xp()
returns table (
  class_id uuid,
  class_name text,
  grade smallint,
  week_xp bigint,
  student_count int
)
language sql
security definer
as $$
  select
    c.id,
    c.name,
    c.grade,
    coalesce(sum(s.xp_awarded), 0)::bigint as week_xp,
    count(distinct p.id)::int as student_count
  from classes c
  left join profiles p on p.class_id = c.id and p.role = 'student'
  left join submissions s on s.user_id = p.id
    and s.verdict = 'accepted'
    and s.is_first_accepted = true
    and s.created_at >= now() - interval '7 days'
  group by c.id, c.name, c.grade
  order by week_xp desc, c.name asc;
$$;

grant execute on function class_week_xp() to authenticated;
