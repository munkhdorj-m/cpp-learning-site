// Hand-authored to match supabase/schema.sql.
// To regenerate from a live Supabase project:
//   npx supabase gen types typescript --project-id <ref> --schema public > types/database.ts

export type UserRole = "student" | "teacher";
export type Difficulty = "easy" | "medium" | "hard";
export type QuestType = "predict_output" | "bug_hunt" | "multiple_choice";
export type Verdict =
  | "pending"
  | "judging"
  | "accepted"
  | "wrong_answer"
  | "time_limit_exceeded"
  | "memory_limit_exceeded"
  | "runtime_error"
  | "compile_error"
  | "internal_error";

type Timestamp = string;

type ProfileRow = {
  id: string;
  username: string;
  display_name: string;
  role: UserRole;
  class_id: string | null;
  xp: number;
  level: number;
  problems_solved: number;
  streak_days: number;
  last_solve_date: string | null;
  avatar_seed: string;
  preferred_locale: "mn" | "en";
  created_at: Timestamp;
  updated_at: Timestamp;
};

type ProfileInsert = {
  id: string;
  username: string;
  display_name: string;
  role?: UserRole;
  class_id?: string | null;
  xp?: number;
  level?: number;
  problems_solved?: number;
  streak_days?: number;
  last_solve_date?: string | null;
  avatar_seed?: string;
  preferred_locale?: "mn" | "en";
};

type ProfileUpdate = {
  display_name?: string;
  avatar_seed?: string;
  preferred_locale?: "mn" | "en";
};

type ClassRow = {
  id: string;
  name: string;
  grade: 7 | 8;
  invite_code: string;
  teacher_id: string | null;
  created_at: Timestamp;
};

type ClassInsert = {
  id?: string;
  name: string;
  grade: 7 | 8;
  invite_code: string;
  teacher_id?: string | null;
};

type ClassUpdate = {
  name?: string;
  grade?: 7 | 8;
  invite_code?: string;
  teacher_id?: string | null;
};

type ProblemRow = {
  id: string;
  slug: string;
  title_mn: string;
  title_en: string | null;
  statement_mn: string;
  statement_en: string | null;
  input_format_mn: string | null;
  input_format_en: string | null;
  output_format_mn: string | null;
  output_format_en: string | null;
  constraints_mn: string | null;
  constraints_en: string | null;
  difficulty: Difficulty;
  time_limit_ms: number;
  memory_limit_kb: number;
  tags: string[];
  xp_reward: number;
  is_public: boolean;
  created_by: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type ProblemInsert = {
  id?: string;
  slug: string;
  title_mn: string;
  title_en?: string | null;
  statement_mn: string;
  statement_en?: string | null;
  input_format_mn?: string | null;
  input_format_en?: string | null;
  output_format_mn?: string | null;
  output_format_en?: string | null;
  constraints_mn?: string | null;
  constraints_en?: string | null;
  difficulty?: Difficulty;
  time_limit_ms?: number;
  memory_limit_kb?: number;
  tags?: string[];
  xp_reward?: number;
  is_public?: boolean;
  created_by?: string | null;
};

type ProblemUpdate = Partial<ProblemInsert>;

type TestCaseRow = {
  id: string;
  problem_id: string;
  stdin: string;
  expected_stdout: string;
  is_sample: boolean;
  order_idx: number;
};

type TestCaseInsert = {
  id?: string;
  problem_id: string;
  stdin: string;
  expected_stdout: string;
  is_sample?: boolean;
  order_idx?: number;
};

type TestCaseUpdate = Partial<TestCaseInsert>;

type SubmissionRow = {
  id: string;
  user_id: string;
  problem_id: string;
  code: string;
  language: string;
  verdict: Verdict;
  runtime_ms: number | null;
  memory_kb: number | null;
  passed_tests: number;
  total_tests: number;
  failed_test_idx: number | null;
  compile_output: string | null;
  stderr_output: string | null;
  judge_response: Record<string, unknown> | null;
  assignment_id: string | null;
  contest_id: string | null;
  is_first_accepted: boolean;
  xp_awarded: number;
  created_at: Timestamp;
};

type SubmissionInsert = {
  id?: string;
  user_id: string;
  problem_id: string;
  code: string;
  language?: string;
  verdict?: Verdict;
  assignment_id?: string | null;
  contest_id?: string | null;
};

type SubmissionUpdate = {
  verdict?: Verdict;
  runtime_ms?: number | null;
  memory_kb?: number | null;
  passed_tests?: number;
  total_tests?: number;
  failed_test_idx?: number | null;
  compile_output?: string | null;
  stderr_output?: string | null;
  judge_response?: Record<string, unknown> | null;
};

type AssignmentRow = {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  start_at: Timestamp;
  due_at: Timestamp;
  allow_late: boolean;
  late_penalty_pct: number;
  created_by: string | null;
  created_at: Timestamp;
};

type AssignmentInsert = {
  id?: string;
  class_id: string;
  title: string;
  description?: string | null;
  start_at?: Timestamp;
  due_at: Timestamp;
  allow_late?: boolean;
  late_penalty_pct?: number;
  created_by?: string | null;
};

type AssignmentUpdate = Partial<AssignmentInsert>;

type AssignmentProblemRow = {
  assignment_id: string;
  problem_id: string;
  points: number;
  order_idx: number;
};

type AssignmentProblemInsert = {
  assignment_id: string;
  problem_id: string;
  points?: number;
  order_idx?: number;
};

type AssignmentProblemUpdate = { points?: number; order_idx?: number };

type ContestRow = {
  id: string;
  title: string;
  description: string | null;
  start_at: Timestamp;
  end_at: Timestamp;
  class_id: string | null;
  created_by: string | null;
  created_at: Timestamp;
};

type ContestInsert = {
  id?: string;
  title: string;
  description?: string | null;
  start_at: Timestamp;
  end_at: Timestamp;
  class_id?: string | null;
  created_by?: string | null;
};

type ContestUpdate = Partial<ContestInsert>;

type ContestProblemRow = {
  contest_id: string;
  problem_id: string;
  points: number;
  order_idx: number;
};

type ContestProblemInsert = {
  contest_id: string;
  problem_id: string;
  points?: number;
  order_idx?: number;
};

type ContestProblemUpdate = { points?: number; order_idx?: number };

type BadgeRow = {
  id: string;
  code: string;
  name_mn: string;
  name_en: string;
  description_mn: string;
  description_en: string;
  icon: string;
  color: string;
  created_at: Timestamp;
};

type BadgeInsert = {
  id?: string;
  code: string;
  name_mn: string;
  name_en: string;
  description_mn: string;
  description_en: string;
  icon: string;
  color?: string;
};

type BadgeUpdate = Partial<BadgeInsert>;

type UserBadgeRow = {
  user_id: string;
  badge_id: string;
  earned_at: Timestamp;
};

type UserBadgeInsert = {
  user_id: string;
  badge_id: string;
};

type CodeSimilarityRow = {
  id: string;
  submission_a_id: string;
  submission_b_id: string;
  problem_id: string;
  similarity: number;
  class_id: string | null;
  reviewed: boolean;
  created_at: Timestamp;
};

type CodeSimilarityInsert = {
  id?: string;
  submission_a_id: string;
  submission_b_id: string;
  problem_id: string;
  similarity: number;
  class_id?: string | null;
  reviewed?: boolean;
};

type CodeSimilarityUpdate = { reviewed?: boolean };

type QuestRow = {
  id: string;
  slug: string;
  type: QuestType;
  prompt_mn: string;
  prompt_en: string | null;
  code_snippet: string | null;
  choices_mn: string[] | null;
  choices_en: string[] | null;
  correct_answer: string;
  explanation_mn: string | null;
  explanation_en: string | null;
  difficulty: Difficulty;
  xp_reward: number;
  tags: string[];
  is_active: boolean;
  created_by: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type QuestInsert = {
  id?: string;
  slug: string;
  type: QuestType;
  prompt_mn: string;
  prompt_en?: string | null;
  code_snippet?: string | null;
  choices_mn?: string[] | null;
  choices_en?: string[] | null;
  correct_answer: string;
  explanation_mn?: string | null;
  explanation_en?: string | null;
  difficulty?: Difficulty;
  xp_reward?: number;
  tags?: string[];
  is_active?: boolean;
  created_by?: string | null;
};

type QuestUpdate = Partial<QuestInsert>;

type UserQuestAttemptRow = {
  user_id: string;
  quest_id: string;
  was_correct: boolean;
  user_answer: string | null;
  xp_awarded: number;
  answered_at: Timestamp;
};

type UserQuestAttemptInsert = {
  user_id: string;
  quest_id: string;
  was_correct: boolean;
  user_answer?: string | null;
  xp_awarded?: number;
};

type GameAttemptRow = {
  user_id: string;
  day: string;
  score: number;
  xp_awarded: number;
  plays: number;
  best_combo: number;
  played_at: Timestamp;
};

type GameAttemptInsert = {
  user_id: string;
  day: string;
  score?: number;
  xp_awarded?: number;
  plays?: number;
  best_combo?: number;
};

type GameAttemptUpdate = {
  score?: number;
  xp_awarded?: number;
  plays?: number;
  best_combo?: number;
  played_at?: Timestamp;
};

type RobotProgressRow = {
  user_id: string;
  level_id: string;
  xp_awarded: number;
  instruction_count: number;
  completed_at: Timestamp;
};

type RobotProgressInsert = {
  user_id: string;
  level_id: string;
  xp_awarded?: number;
  instruction_count?: number;
};

type RobotLevelRow = {
  id: string;
  course: string;
  name_mn: string;
  name_en: string;
  hint_mn: string;
  hint_en: string;
  hints_mn: string[];
  hints_en: string[];
  width: number;
  height: number;
  layout: string[];
  robot_x: number;
  robot_y: number;
  robot_dir: number;
  targets: { x: number; y: number }[];
  dangers: { x: number; y: number }[];
  palette: string[];
  max_blocks: number;
  xp_reward: number;
  created_by: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

type RobotLevelInsert = {
  id: string;
  course?: string;
  name_mn: string;
  name_en: string;
  hint_mn?: string;
  hint_en?: string;
  hints_mn?: string[];
  hints_en?: string[];
  width?: number;
  height?: number;
  layout?: string[];
  robot_x?: number;
  robot_y?: number;
  robot_dir?: number;
  targets?: { x: number; y: number }[];
  dangers?: { x: number; y: number }[];
  palette?: string[];
  max_blocks?: number;
  xp_reward?: number;
  created_by?: string | null;
};

type RobotLevelUpdate = Partial<RobotLevelInsert>;

type NotificationRow = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: Timestamp;
};

type NotificationInsert = {
  id?: string;
  user_id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  read?: boolean;
};

type NotificationUpdate = {
  read?: boolean;
};

type WithRelationships<T> = T & { Relationships: [] };

export interface Database {
  public: {
    Tables: {
      profiles: WithRelationships<{
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      }>;
      classes: WithRelationships<{
        Row: ClassRow;
        Insert: ClassInsert;
        Update: ClassUpdate;
      }>;
      problems: WithRelationships<{
        Row: ProblemRow;
        Insert: ProblemInsert;
        Update: ProblemUpdate;
      }>;
      test_cases: WithRelationships<{
        Row: TestCaseRow;
        Insert: TestCaseInsert;
        Update: TestCaseUpdate;
      }>;
      submissions: WithRelationships<{
        Row: SubmissionRow;
        Insert: SubmissionInsert;
        Update: SubmissionUpdate;
      }>;
      assignments: WithRelationships<{
        Row: AssignmentRow;
        Insert: AssignmentInsert;
        Update: AssignmentUpdate;
      }>;
      assignment_problems: WithRelationships<{
        Row: AssignmentProblemRow;
        Insert: AssignmentProblemInsert;
        Update: AssignmentProblemUpdate;
      }>;
      contests: WithRelationships<{
        Row: ContestRow;
        Insert: ContestInsert;
        Update: ContestUpdate;
      }>;
      contest_problems: WithRelationships<{
        Row: ContestProblemRow;
        Insert: ContestProblemInsert;
        Update: ContestProblemUpdate;
      }>;
      badges: WithRelationships<{
        Row: BadgeRow;
        Insert: BadgeInsert;
        Update: BadgeUpdate;
      }>;
      user_badges: WithRelationships<{
        Row: UserBadgeRow;
        Insert: UserBadgeInsert;
        Update: { earned_at?: string };
      }>;
      code_similarity: WithRelationships<{
        Row: CodeSimilarityRow;
        Insert: CodeSimilarityInsert;
        Update: CodeSimilarityUpdate;
      }>;
      quests: WithRelationships<{
        Row: QuestRow;
        Insert: QuestInsert;
        Update: QuestUpdate;
      }>;
      user_quest_attempts: WithRelationships<{
        Row: UserQuestAttemptRow;
        Insert: UserQuestAttemptInsert;
        Update: never;
      }>;
      game_attempts: WithRelationships<{
        Row: GameAttemptRow;
        Insert: GameAttemptInsert;
        Update: GameAttemptUpdate;
      }>;
      robot_progress: WithRelationships<{
        Row: RobotProgressRow;
        Insert: RobotProgressInsert;
        Update: never;
      }>;
      robot_levels: WithRelationships<{
        Row: RobotLevelRow;
        Insert: RobotLevelInsert;
        Update: RobotLevelUpdate;
      }>;
      notifications: WithRelationships<{
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      }>;
    };
    Views: Record<string, never>;
    Functions: {
      class_week_xp: {
        Args: Record<string, never>;
        Returns: {
          class_id: string;
          class_name: string;
          grade: number;
          week_xp: number;
          student_count: number;
        }[];
      };
      contest_leaderboard: {
        Args: { contest_id_in: string };
        Returns: {
          user_id: string;
          display_name: string;
          username: string;
          class_name: string | null;
          score: number;
          problems_solved: number;
        }[];
      };
    };
    Enums: {
      user_role: UserRole;
      difficulty: Difficulty;
      verdict: Verdict;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
