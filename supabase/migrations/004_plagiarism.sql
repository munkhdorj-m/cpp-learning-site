-- =====================================================================
-- Migration: add unique constraint to code_similarity so we can upsert
-- (and so dedup is enforced at the DB layer, not just by app logic).
-- =====================================================================

-- Drop any duplicates first (rare, but safer than failing the constraint)
delete from code_similarity a
using code_similarity b
where a.id > b.id
  and a.submission_a_id = b.submission_a_id
  and a.submission_b_id = b.submission_b_id;

alter table code_similarity
  add constraint code_similarity_pair_uniq
  unique (submission_a_id, submission_b_id);
