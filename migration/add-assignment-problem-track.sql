-- Assignment problems become their own track, separate from practice.
--
-- Until now a problem was solved once, ever. Doing it for homework used up the
-- one solve, so the problems page showed it finished and there was nothing
-- left to earn from it. That also meant assignments contributed almost nothing
-- to the Class Cup: the XP a class got from homework was the same XP it would
-- have got from practising the same problem anyway.
--
-- Now a submission belongs to one of two tracks:
--
--   assignment_id IS NULL   practice — the problems page
--   assignment_id = <id>    that assignment
--
-- and `is_first_accepted` means "the first accepted submission IN ITS TRACK".
-- So a student can solve a problem for homework and solve it again as
-- practice, and both count once each.
--
-- submissions.assignment_id already exists (mysql-schema.sql:204) and the
-- submit API already accepted it — nothing ever sent one. This migration adds
-- the index the new lookups need, and backfills history.

-- The first-accept lookup is now (user, problem, track) on every submission,
-- so it needs to be an index rather than a scan of a student's whole history.
CREATE INDEX idx_submissions_track
    ON submissions (user_id, problem_id, assignment_id);

-- ---------------------------------------------------------------------------
-- Backfill: put past homework in the assignment track.
--
-- Without this, every assignment in the system reads as nobody having done any
-- of it, because no existing submission carries an assignment_id. This matches
-- an accepted submission to an assignment when ALL of these hold:
--
--   * the submission has no track yet, and was accepted
--   * the student's class was set that assignment
--   * that assignment contains that problem
--   * the submission was made inside the assignment's window
--
-- Where a problem sits in two assignments whose windows overlap, the one that
-- opened most recently wins — it is the one the student was most likely
-- working on. That is a guess, and it is only ever applied to history; every
-- submission from here on carries its real track.
--
-- Deliberately NOT idempotent in the "runs twice, same result" sense: it only
-- ever touches rows where assignment_id IS NULL, so running it again is
-- harmless but will also pick up nothing new.
UPDATE submissions s
   JOIN profiles p ON p.id = s.user_id
   SET s.assignment_id = (
     SELECT a.id
       FROM assignments a
       JOIN assignment_problems ap
         ON ap.assignment_id = a.id AND ap.problem_id = s.problem_id
      WHERE a.class_id = p.class_id
        AND s.created_at >= a.start_at
        AND s.created_at <= a.due_at
      ORDER BY a.start_at DESC
      LIMIT 1
   )
 WHERE s.assignment_id IS NULL
   AND s.verdict = 'accepted';

-- A backfilled row was the first accepted submission in its new track if no
-- earlier accepted submission shares that track. Recompute the flag for
-- everything the UPDATE above moved, so assignment progress bars are right.
UPDATE submissions s
   JOIN (
     SELECT MIN(created_at) AS first_at, user_id, problem_id, assignment_id
       FROM submissions
      WHERE verdict = 'accepted' AND assignment_id IS NOT NULL
      GROUP BY user_id, problem_id, assignment_id
   ) f
     ON f.user_id = s.user_id
    AND f.problem_id = s.problem_id
    AND f.assignment_id = s.assignment_id
   SET s.is_first_accepted = (s.created_at = f.first_at)
 WHERE s.verdict = 'accepted'
   AND s.assignment_id IS NOT NULL;

-- Same recompute for what is left in the practice track: a student whose only
-- accepted submission just moved into an assignment now has no first-accept in
-- practice, and the problems page should show that problem as open again.
UPDATE submissions s
   JOIN (
     SELECT MIN(created_at) AS first_at, user_id, problem_id
       FROM submissions
      WHERE verdict = 'accepted' AND assignment_id IS NULL
      GROUP BY user_id, problem_id
   ) f
     ON f.user_id = s.user_id
    AND f.problem_id = s.problem_id
   SET s.is_first_accepted = (s.created_at = f.first_at)
 WHERE s.verdict = 'accepted'
   AND s.assignment_id IS NULL;
