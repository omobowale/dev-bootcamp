-- Phase 10: multiple-choice quizzes, one per ClassSession, auto-graded server-side.
-- Correct answers are never exposed to a student before they submit an attempt — see
-- StudentQuizService, which strips `is_correct` from the question payload it returns.
CREATE TABLE quizzes (
    id BIGSERIAL PRIMARY KEY,
    class_session_id BIGINT NOT NULL UNIQUE REFERENCES class_sessions (id) ON DELETE CASCADE,
    passing_percentage INTEGER NOT NULL DEFAULT 70,
    max_attempts INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Each question carries its own point value and an optional explanation shown after
-- submission (per spec §6). Options are a child @ElementCollection (quiz_question_options),
-- the same pattern as lesson_sections/course_included_items.
CREATE TABLE quiz_questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 1,
    explanation TEXT,
    position INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (quiz_id, position)
);
CREATE INDEX idx_quiz_questions_quiz_id ON quiz_questions (quiz_id);

CREATE TABLE quiz_question_options (
    id BIGSERIAL PRIMARY KEY,
    quiz_question_id BIGINT NOT NULL REFERENCES quiz_questions (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    text VARCHAR(500) NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (quiz_question_id, position)
);
CREATE INDEX idx_quiz_question_options_question_id ON quiz_question_options (quiz_question_id);

-- A student's answers reference the option they picked by its position within the question
-- (0-3), not a foreign key to a specific option row: options are always edited as a whole unit
-- with their parent question (see QuizOption's javadoc), so there is no stable per-option id to
-- reference. Editing a question's options after it has attempts is an accepted, documented
-- trade-off, same as any quiz platform where changing a question after answers exist changes
-- what those historical answers mean.
CREATE TABLE quiz_attempts (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes (id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    submitted_at TIMESTAMP,
    score INTEGER,
    total_possible INTEGER,
    percentage DOUBLE PRECISION,
    passed BOOLEAN,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_quiz_attempts_quiz_id_student_id ON quiz_attempts (quiz_id, student_id);

CREATE TABLE quiz_answers (
    id BIGSERIAL PRIMARY KEY,
    attempt_id BIGINT NOT NULL REFERENCES quiz_attempts (id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES quiz_questions (id) ON DELETE CASCADE,
    selected_option_position INTEGER,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (attempt_id, question_id)
);
CREATE INDEX idx_quiz_answers_attempt_id ON quiz_answers (attempt_id);
