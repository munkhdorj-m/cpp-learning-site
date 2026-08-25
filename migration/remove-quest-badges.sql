-- The daily quests are gone, so the badges for them are too.
--
-- `quest_10`, `quest_50` and `quest_perfect_day` all describe something a
-- student can no longer do. Left in place they would sit on every profile as
-- permanently locked badges pointing at a page nothing links to any more —
-- the exact problem lib/badges.ts exists to prevent.
--
-- user_badges.badge_id is ON DELETE CASCADE (migration/mysql-schema.sql:246),
-- so deleting the badge rows also removes them from the profiles of students
-- who had already earned them. That is intended: a badge that no longer exists
-- should not still be displayed. It is also irreversible for those students —
-- if you would rather keep the earned ones on show, do not run this file, and
-- put the three specs back in lib/badges.ts instead.
--
-- Safe to run more than once.

DELETE FROM badges
 WHERE code IN ('quest_10', 'quest_50', 'quest_perfect_day');
