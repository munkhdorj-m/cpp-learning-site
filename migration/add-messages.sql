-- Asking the teacher a question.
--
-- There was no way for a student to say anything to a teacher through the
-- site. The notifications table has existed since the Supabase days and
-- nothing has ever written a row to it; this is a different thing anyway —
-- a conversation, with a reply.
--
-- Shape: a thread has two ends — one student and one teacher the student
-- picked — and messages hang off it. Only those two can read it.
--
-- The teacher is chosen rather than derived: classes.teacher_id is nullable
-- and mostly unset here, so "the teacher of this student's class" would be
-- nobody for most students.
--
-- Safe to run more than once. Depends only on the base schema.

CREATE TABLE IF NOT EXISTS message_threads (
  id              CHAR(36)     NOT NULL,
  student_id      CHAR(36)     NOT NULL,
  -- Which teacher the student addressed it to. NULL means "any teacher",
  -- which is what threads created before add-message-teacher.sql have.
  teacher_id      CHAR(36)     NULL,
  -- Copied at creation so a thread still says which class it came from after
  -- the student is moved up a year.
  class_id        CHAR(36)     NULL,
  subject         VARCHAR(200) NOT NULL,
  created_at      DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  -- Denormalised so the thread list can sort without touching messages.
  last_message_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  closed_at       DATETIME(6)  NULL,
  PRIMARY KEY (id),
  KEY idx_mt_student (student_id, last_message_at),
  KEY idx_mt_teacher (teacher_id, last_message_at),
  KEY idx_mt_recent (last_message_at),
  CONSTRAINT fk_mt_student FOREIGN KEY (student_id)
    REFERENCES profiles (id) ON DELETE CASCADE,
  -- SET NULL, not CASCADE: a teacher leaving must not delete the students'
  -- questions along with their account.
  CONSTRAINT fk_mt_teacher FOREIGN KEY (teacher_id)
    REFERENCES profiles (id) ON DELETE SET NULL,
  CONSTRAINT fk_mt_class FOREIGN KEY (class_id)
    REFERENCES classes (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS messages (
  id           CHAR(36)    NOT NULL,
  thread_id    CHAR(36)    NOT NULL,
  sender_id    CHAR(36)    NOT NULL,
  -- The sender's role AT THE TIME OF SENDING. A role can change; who said
  -- what in a conversation cannot.
  from_teacher BOOLEAN     NOT NULL DEFAULT FALSE,
  body         TEXT        NOT NULL,
  created_at   DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  -- When the other side read it. NULL means unread, which is what the badge
  -- in the header counts.
  read_at      DATETIME(6) NULL,
  PRIMARY KEY (id),
  KEY idx_msg_thread (thread_id, created_at),
  KEY idx_msg_unread (thread_id, read_at),
  CONSTRAINT fk_msg_thread FOREIGN KEY (thread_id)
    REFERENCES message_threads (id) ON DELETE CASCADE,
  CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id)
    REFERENCES profiles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
