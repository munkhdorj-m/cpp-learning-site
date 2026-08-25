-- Asking the teacher a question.
--
-- There was no way for a student to say anything to a teacher through the
-- site. The notifications table has existed since the Supabase days and
-- nothing has ever written a row to it; this is a different thing anyway —
-- a conversation, with a reply.
--
-- Shape: a thread belongs to one student and has a subject; messages hang off
-- it. Teachers are not stored on the thread. That is deliberate — classes.
-- teacher_id is nullable and frequently unset in this database, so a thread
-- addressed to "the teacher of this student's class" would be addressed to
-- nobody for most students. Every teacher sees every thread, which is how the
-- rest of the teacher pages already work (see lib/auth-helpers.ts: the role is
-- global, class ownership is not enforced anywhere).
--
-- Safe to run more than once. Depends only on the base schema.

CREATE TABLE IF NOT EXISTS message_threads (
  id              CHAR(36)     NOT NULL,
  student_id      CHAR(36)     NOT NULL,
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
  KEY idx_mt_recent (last_message_at),
  CONSTRAINT fk_mt_student FOREIGN KEY (student_id)
    REFERENCES profiles (id) ON DELETE CASCADE,
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
