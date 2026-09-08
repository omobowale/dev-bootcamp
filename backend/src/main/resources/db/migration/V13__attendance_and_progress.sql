-- Phase 12: admin-entered attendance (spec §11), student-marked class completion, and
-- per-course completion criteria feeding the progress % calculation (spec §10, §12).
CREATE TABLE attendance_records (
    id BIGSERIAL PRIMARY KEY,
    class_session_id BIGINT NOT NULL REFERENCES class_sessions (id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    check_in_time TIMESTAMP,
    check_out_time TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (class_session_id, student_id)
);
CREATE INDEX idx_attendance_records_class_session_id ON attendance_records (class_session_id);
CREATE INDEX idx_attendance_records_student_id ON attendance_records (student_id);

-- A student explicitly marks a class as done (spec §10's "Lesson/class completion") — there's
-- no other reliable "the student is finished with this" signal, since a class isn't required to
-- have a quiz or assignment attached to infer completion from.
CREATE TABLE class_completions (
    id BIGSERIAL PRIMARY KEY,
    class_session_id BIGINT NOT NULL REFERENCES class_sessions (id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (class_session_id, student_id)
);
CREATE INDEX idx_class_completions_student_id ON class_completions (student_id);

-- One row per course, created lazily with sensible defaults on first admin edit (same
-- get-or-create pattern as Quiz/Assignment). Absence of a row means "use the defaults" —
-- StudentProgressService treats a missing row the same as one with these exact values.
CREATE TABLE course_completion_criteria (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL UNIQUE REFERENCES courses (id) ON DELETE CASCADE,
    require_all_classes_completed BOOLEAN NOT NULL DEFAULT true,
    require_all_quizzes_passed BOOLEAN NOT NULL DEFAULT false,
    require_all_assignments_reviewed BOOLEAN NOT NULL DEFAULT false,
    min_attendance_percentage INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);
