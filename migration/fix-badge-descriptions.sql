-- The badge nothing used to award now has a rule behind it, so its
-- description has to describe that rule.
--
-- "Top of class leaderboard for a week" promised something the site could not
-- measure without a scheduler. What it does is a rolling seven days, evaluated
-- whenever the student earns XP, and the text now says that. See
-- lib/badge-rules.ts for the guards (a class of one, zero XP, and ties).

UPDATE badges
   SET description_en = 'Top XP earner in your class over the last 7 days',
       description_mn = 'Сүүлийн 7 хоногт ангидаа хамгийн их XP цуглуулсан'
 WHERE code = 'class_champion';

-- quest_perfect_day used to be described here. It is deleted outright now,
-- along with the other two daily-quest badges — see
-- migration/remove-quest-badges.sql.

-- Bug Smash no longer pays XP, so a badge worth "100 XP from Bug Smash" was
-- describing something that cannot happen. It could not happen before either:
-- the daily XP cap was 60 and the check compared against that same daily
-- total, so no student could ever reach 100. It is a score now — the same
-- number, and one a good round actually passes.
UPDATE badges
   SET description_en = 'Scored 100 in a single round of Bug Smash',
       description_mn = 'Bug Smash-д нэг тойрогт 100 оноо авсан'
 WHERE code = 'smash_100';
