-- =====================================================================
-- CPP Judge — MySQL 8 schema  (migrated from Supabase/Postgres)
-- Run this ONCE in phpMyAdmin on a fresh, empty database.
-- Safe: this touches only the new MySQL database — never your live site.
--
-- Translation notes (Postgres -> MySQL 8):
--   uuid            -> CHAR(36)      (keeps the exact ids from the export,
--                                     so all foreign keys still line up)
--   text[] / jsonb  -> JSON
--   enum types      -> ENUM(...)
--   timestamptz     -> DATETIME(6)   (UTC)
--   boolean         -> BOOLEAN (TINYINT(1))
--   RLS policies    -> REMOVED. MySQL has no row-level security; access
--                      control moves into the app's server code.
--   plpgsql triggers-> REMOVED. XP / level / streak / badge / quest / game
--                      awarding now happens in application code (Node),
--                      not in the database.
--   AUTH: Supabase Auth is gone. `profiles` gains `email` + `password_hash`
--         and becomes the single user/login table (custom bcrypt auth).
-- =====================================================================

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

-- ---------- classes (teacher_id FK added after profiles) ----------
CREATE TABLE classes (
  id          CHAR(36)      NOT NULL,
  name        VARCHAR(64)   NOT NULL,
  grade       TINYINT       NOT NULL,
  invite_code VARCHAR(64)   NOT NULL,
  teacher_id  CHAR(36)      NULL,
  created_at  DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_classes_invite (invite_code),
  KEY idx_classes_teacher (teacher_id),
  CONSTRAINT chk_classes_grade CHECK (grade BETWEEN 1 AND 12)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- profiles (also the auth/login table now) ----------
CREATE TABLE profiles (
  id               CHAR(36)     NOT NULL,
  email            VARCHAR(255) NOT NULL,             -- NEW (from auth.users)
  password_hash    VARCHAR(255) NOT NULL DEFAULT '',  -- NEW (bcrypt; blank until set)
  username         VARCHAR(20)  NOT NULL,
  display_name     VARCHAR(120) NOT NULL,
  role             ENUM('student','teacher') NOT NULL DEFAULT 'student',
  class_id         CHAR(36)     NULL,
  xp               INT          NOT NULL DEFAULT 0,
  level            SMALLINT     NOT NULL DEFAULT 1,
  problems_solved  INT          NOT NULL DEFAULT 0,
  streak_days      SMALLINT     NOT NULL DEFAULT 0,
  last_solve_date  DATE         NULL,
  avatar_seed      VARCHAR(64)  NOT NULL,
  preferred_locale ENUM('mn','en') NOT NULL DEFAULT 'mn',
  created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_profiles_email (email),
  UNIQUE KEY uq_profiles_username (username),
  KEY idx_profiles_class (class_id),
  KEY idx_profiles_xp (xp DESC),
  CONSTRAINT chk_profiles_username_len CHECK (CHAR_LENGTH(username) BETWEEN 3 AND 20),
  CONSTRAINT fk_profiles_class FOREIGN KEY (class_id)
    REFERENCES classes (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE classes
  ADD CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id)
  REFERENCES profiles (id) ON DELETE SET NULL;

-- ---------- problems ----------
CREATE TABLE problems (
  id               CHAR(36)     NOT NULL,
  slug             VARCHAR(255) NOT NULL,
  title_mn         VARCHAR(255) NOT NULL,
  title_en         VARCHAR(255) NULL,
  statement_mn     MEDIUMTEXT   NOT NULL,
  statement_en     MEDIUMTEXT   NULL,
  input_format_mn  MEDIUMTEXT   NULL,
  input_format_en  MEDIUMTEXT   NULL,
  output_format_mn MEDIUMTEXT   NULL,
  output_format_en MEDIUMTEXT   NULL,
  constraints_mn   MEDIUMTEXT   NULL,
  constraints_en   MEDIUMTEXT   NULL,
  difficulty       ENUM('easy','medium','hard') NOT NULL DEFAULT 'easy',
  time_limit_ms    INT          NOT NULL DEFAULT 1000,
  memory_limit_kb  INT          NOT NULL DEFAULT 65536,
  tags             JSON         NOT NULL,
  xp_reward        INT          NOT NULL DEFAULT 10,
  is_public        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by       CHAR(36)     NULL,
  created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_problems_slug (slug),
  KEY idx_problems_public (is_public),
  KEY idx_problems_difficulty (difficulty),
  CONSTRAINT fk_problems_creator FOREIGN KEY (created_by)
    REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- test_cases ----------
CREATE TABLE test_cases (
  id              CHAR(36)    NOT NULL,
  problem_id      CHAR(36)    NOT NULL,
  stdin           MEDIUMTEXT  NOT NULL,
  expected_stdout MEDIUMTEXT  NOT NULL,
  is_sample       BOOLEAN     NOT NULL DEFAULT FALSE,
  order_idx       SMALLINT    NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_test_cases_problem (problem_id, order_idx),
  CONSTRAINT fk_test_cases_problem FOREIGN KEY (problem_id)
    REFERENCES problems (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- assignments ----------
CREATE TABLE assignments (
  id               CHAR(36)     NOT NULL,
  class_id         CHAR(36)     NOT NULL,
  title            VARCHAR(255) NOT NULL,
  description      TEXT         NULL,
  start_at         DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  due_at           DATETIME(6)  NOT NULL,
  allow_late       BOOLEAN      NOT NULL DEFAULT TRUE,
  late_penalty_pct SMALLINT     NOT NULL DEFAULT 50,
  created_by       CHAR(36)     NULL,
  created_at       DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_assignments_class (class_id, due_at),
  CONSTRAINT chk_assignments_penalty CHECK (late_penalty_pct BETWEEN 0 AND 100),
  CONSTRAINT fk_assignments_class FOREIGN KEY (class_id)
    REFERENCES classes (id) ON DELETE CASCADE,
  CONSTRAINT fk_assignments_creator FOREIGN KEY (created_by)
    REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE assignment_problems (
  assignment_id CHAR(36) NOT NULL,
  problem_id    CHAR(36) NOT NULL,
  points        INT      NOT NULL DEFAULT 100,
  order_idx     SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (assignment_id, problem_id),
  KEY idx_ap_problem (problem_id),
  CONSTRAINT chk_ap_points CHECK (points > 0),
  CONSTRAINT fk_ap_assignment FOREIGN KEY (assignment_id)
    REFERENCES assignments (id) ON DELETE CASCADE,
  CONSTRAINT fk_ap_problem FOREIGN KEY (problem_id)
    REFERENCES problems (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- contests ----------
CREATE TABLE contests (
  id          CHAR(36)     NOT NULL,
  title       VARCHAR(255) NOT NULL,
  description TEXT         NULL,
  start_at    DATETIME(6)  NOT NULL,
  end_at      DATETIME(6)  NOT NULL,
  class_id    CHAR(36)     NULL,
  created_by  CHAR(36)     NULL,
  created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_contests_class (class_id, start_at),
  CONSTRAINT chk_contests_window CHECK (end_at > start_at),
  CONSTRAINT fk_contests_class FOREIGN KEY (class_id)
    REFERENCES classes (id) ON DELETE CASCADE,
  CONSTRAINT fk_contests_creator FOREIGN KEY (created_by)
    REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE contest_problems (
  contest_id CHAR(36) NOT NULL,
  problem_id CHAR(36) NOT NULL,
  points     INT      NOT NULL DEFAULT 100,
  order_idx  SMALLINT NOT NULL DEFAULT 0,
  PRIMARY KEY (contest_id, problem_id),
  KEY idx_cp_problem (problem_id),
  CONSTRAINT fk_cp_contest FOREIGN KEY (contest_id)
    REFERENCES contests (id) ON DELETE CASCADE,
  CONSTRAINT fk_cp_problem FOREIGN KEY (problem_id)
    REFERENCES problems (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- submissions ----------
CREATE TABLE submissions (
  id                CHAR(36)    NOT NULL,
  user_id           CHAR(36)    NOT NULL,
  problem_id        CHAR(36)    NOT NULL,
  code              MEDIUMTEXT  NOT NULL,
  language          VARCHAR(16) NOT NULL DEFAULT 'cpp',
  verdict           ENUM('pending','judging','accepted','wrong_answer',
                         'time_limit_exceeded','memory_limit_exceeded',
                         'runtime_error','compile_error','internal_error')
                    NOT NULL DEFAULT 'pending',
  runtime_ms        INT         NULL,
  memory_kb         INT         NULL,
  passed_tests      SMALLINT    NOT NULL DEFAULT 0,
  total_tests       SMALLINT    NOT NULL DEFAULT 0,
  failed_test_idx   SMALLINT    NULL,
  compile_output    MEDIUMTEXT  NULL,
  stderr_output     MEDIUMTEXT  NULL,
  judge_response    JSON        NULL,
  assignment_id     CHAR(36)    NULL,
  contest_id        CHAR(36)    NULL,
  is_first_accepted BOOLEAN     NOT NULL DEFAULT FALSE,
  xp_awarded        INT         NOT NULL DEFAULT 0,
  created_at        DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_sub_user_created (user_id, created_at DESC),
  KEY idx_sub_problem_user (problem_id, user_id),
  KEY idx_sub_verdict (verdict),
  CONSTRAINT fk_sub_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_problem FOREIGN KEY (problem_id)
    REFERENCES problems (id) ON DELETE CASCADE,
  CONSTRAINT fk_sub_assignment FOREIGN KEY (assignment_id)
    REFERENCES assignments (id) ON DELETE SET NULL,
  CONSTRAINT fk_sub_contest FOREIGN KEY (contest_id)
    REFERENCES contests (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- badges + user_badges ----------
CREATE TABLE badges (
  id             CHAR(36)     NOT NULL,
  code           VARCHAR(64)  NOT NULL,
  name_mn        VARCHAR(120) NOT NULL,
  name_en        VARCHAR(120) NOT NULL,
  description_mn VARCHAR(255) NOT NULL,
  description_en VARCHAR(255) NOT NULL,
  icon           VARCHAR(64)  NOT NULL,
  color          VARCHAR(32)  NOT NULL DEFAULT 'amber',
  created_at     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_badges_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_badges (
  user_id   CHAR(36)    NOT NULL,
  badge_id  CHAR(36)    NOT NULL,
  earned_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, badge_id),
  KEY idx_user_badges_user (user_id),
  CONSTRAINT fk_ub_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id)
    REFERENCES badges (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- code_similarity (plagiarism) ----------
CREATE TABLE code_similarity (
  id               CHAR(36)    NOT NULL,
  submission_a_id  CHAR(36)    NOT NULL,
  submission_b_id  CHAR(36)    NOT NULL,
  problem_id       CHAR(36)    NOT NULL,
  similarity       FLOAT       NOT NULL,
  class_id         CHAR(36)    NULL,
  reviewed         BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at       DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_similarity_pair (submission_a_id, submission_b_id),
  KEY idx_similarity_problem (problem_id, similarity DESC),
  KEY idx_similarity_class (class_id, reviewed),
  CONSTRAINT chk_similarity_range CHECK (similarity BETWEEN 0 AND 1),
  CONSTRAINT fk_sim_a FOREIGN KEY (submission_a_id)
    REFERENCES submissions (id) ON DELETE CASCADE,
  CONSTRAINT fk_sim_b FOREIGN KEY (submission_b_id)
    REFERENCES submissions (id) ON DELETE CASCADE,
  CONSTRAINT fk_sim_problem FOREIGN KEY (problem_id)
    REFERENCES problems (id) ON DELETE CASCADE,
  CONSTRAINT fk_sim_class FOREIGN KEY (class_id)
    REFERENCES classes (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- quests + attempts ----------
CREATE TABLE quests (
  id              CHAR(36)     NOT NULL,
  slug            VARCHAR(255) NOT NULL,
  type            ENUM('predict_output','bug_hunt','multiple_choice') NOT NULL,
  prompt_mn       TEXT         NOT NULL,
  prompt_en       TEXT         NULL,
  code_snippet    TEXT         NULL,
  choices_mn      JSON         NULL,
  choices_en      JSON         NULL,
  correct_answer  VARCHAR(255) NOT NULL,
  explanation_mn  TEXT         NULL,
  explanation_en  TEXT         NULL,
  difficulty      ENUM('easy','medium','hard') NOT NULL DEFAULT 'easy',
  xp_reward       INT          NOT NULL DEFAULT 10,
  tags            JSON         NOT NULL,
  is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by      CHAR(36)     NULL,
  created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                               ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  UNIQUE KEY uq_quests_slug (slug),
  KEY idx_quests_active (is_active),
  CONSTRAINT fk_quests_creator FOREIGN KEY (created_by)
    REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE user_quest_attempts (
  user_id     CHAR(36)     NOT NULL,
  quest_id    CHAR(36)     NOT NULL,
  was_correct BOOLEAN      NOT NULL,
  user_answer VARCHAR(255) NULL,
  xp_awarded  INT          NOT NULL DEFAULT 0,
  answered_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, quest_id),
  KEY idx_uqa_quest (quest_id),
  CONSTRAINT fk_uqa_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT fk_uqa_quest FOREIGN KEY (quest_id)
    REFERENCES quests (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- game_attempts (Bug Smash: one row per user per day) ----------
CREATE TABLE game_attempts (
  user_id    CHAR(36)    NOT NULL,
  day        DATE        NOT NULL,
  score      INT         NOT NULL DEFAULT 0,
  xp_awarded INT         NOT NULL DEFAULT 0,
  plays      INT         NOT NULL DEFAULT 0,
  best_combo INT         NOT NULL DEFAULT 0,
  played_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, day),
  CONSTRAINT fk_game_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- robot_levels (text-slug id) ----------
CREATE TABLE robot_levels (
  id          VARCHAR(64)  NOT NULL,
  course      VARCHAR(32)  NOT NULL DEFAULT 'basics',
  name_mn     VARCHAR(255) NOT NULL,
  name_en     VARCHAR(255) NOT NULL,
  hint_mn     TEXT         NULL,
  hint_en     TEXT         NULL,
  width       INT          NOT NULL,
  height      INT          NOT NULL,
  layout      JSON         NOT NULL,
  robot_x     INT          NOT NULL,
  robot_y     INT          NOT NULL,
  robot_dir   VARCHAR(8)   NOT NULL,
  targets     JSON         NULL,
  dangers     JSON         NULL,
  palette     JSON         NULL,
  max_blocks  INT          NULL,
  xp_reward   INT          NOT NULL DEFAULT 5,
  created_by  CHAR(36)     NULL,
  created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                           ON UPDATE CURRENT_TIMESTAMP(6),
  hints_mn    JSON         NOT NULL,
  hints_en    JSON         NOT NULL,
  PRIMARY KEY (id),
  KEY idx_robot_levels_course (course),
  CONSTRAINT fk_robot_levels_creator FOREIGN KEY (created_by)
    REFERENCES profiles (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- robot_progress (one row per user+level) ----------
CREATE TABLE robot_progress (
  user_id           CHAR(36)    NOT NULL,
  level_id          VARCHAR(64) NOT NULL,
  xp_awarded        INT         NOT NULL DEFAULT 0,
  instruction_count INT         NULL,
  completed_at      DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (user_id, level_id),
  KEY idx_robot_progress_level (level_id),
  -- NOTE: deliberately NO foreign key on level_id. Most levels are built into
  -- the app code and never exist as robot_levels rows, so a FK here would
  -- reject progress for every built-in level. (Postgres had no FK either.)
  CONSTRAINT fk_rp_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------- notifications ----------
CREATE TABLE notifications (
  id         CHAR(36)     NOT NULL,
  user_id    CHAR(36)     NOT NULL,
  type       VARCHAR(32)  NOT NULL,
  title      VARCHAR(255) NOT NULL,
  body       TEXT         NULL,
  link       VARCHAR(255) NULL,
  is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (id),
  KEY idx_notifications_user (user_id, created_at DESC),
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id)
    REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET foreign_key_checks = 1;
