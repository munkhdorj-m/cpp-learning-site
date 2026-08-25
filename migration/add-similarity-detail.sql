-- Why a pair was flagged, not just how much.
--
-- lib/plagiarism.ts reports three measures and flags on the strongest. Storing
-- only the maximum left a teacher unable to tell "the whole program is the
-- same" from "one function was pasted in", which are different conversations
-- to have with a student.
--
-- `tokens` is the normalised length of the shorter submission: a 96% match on
-- 30 tokens is boilerplate agreeing with itself, and a teacher needs to see
-- that without opening the code.

ALTER TABLE code_similarity
  ADD COLUMN jaccard     FLOAT NULL AFTER similarity,
  ADD COLUMN contained   FLOAT NULL AFTER jaccard,
  ADD COLUMN longest_run FLOAT NULL AFTER contained,
  ADD COLUMN tokens      INT   NULL AFTER longest_run;

-- ---------- signals on a single submission ----------
--
-- Not a plagiarism score and not an "AI probability": see the warning at the
-- top of lib/code-signals.ts. `signal_score` means "how much here is worth a
-- teacher's glance", and `signal_flags` says what was actually found so the
-- teacher can check rather than trust.

ALTER TABLE submissions
  ADD COLUMN signal_score TINYINT UNSIGNED NULL AFTER xp_awarded,
  ADD COLUMN signal_flags JSON             NULL AFTER signal_score;

-- Only the flagged ones are ever listed, so the index only covers those.
CREATE INDEX idx_sub_signals ON submissions (signal_score DESC, created_at DESC);
