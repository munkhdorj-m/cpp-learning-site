-- Allow classes for every grade, not just 7 and 8.
--
-- The original schema restricted classes to grades 7-8. Usernames are now
-- derived from the graduation year (grade 12 = graduating this school year),
-- so the site needs to know about the higher grades too.
--
-- Run ONCE in phpMyAdmin on orkhoncs_cppjudge (and the dev copy if you use
-- one). Safe: it only widens what is allowed. No data changes.

ALTER TABLE classes DROP CHECK chk_classes_grade;

ALTER TABLE classes
  ADD CONSTRAINT chk_classes_grade CHECK (grade BETWEEN 1 AND 12);
