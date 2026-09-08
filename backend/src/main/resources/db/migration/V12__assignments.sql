-- Phase 11: theory/practical assignments, one per ClassSession, reviewed by hand (not
-- auto-graded, unlike quizzes) — see AdminAssignmentService/StudentAssignmentService.
CREATE TABLE assignments (
    id BIGSERIAL PRIMARY KEY,
    class_session_id BIGINT NOT NULL UNIQUE REFERENCES class_sessions (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    learning_objective TEXT,
    instructions TEXT,
    tasks TEXT,
    submission_requirements TEXT,
    max_score INTEGER NOT NULL DEFAULT 100,
    due_at TIMESTAMP,
    rubric TEXT,
    allowed_attachment_types VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- One evolving row per (assignment, student) rather than one row per submission attempt —
-- resubmitting after "Needs Resubmission" updates this same row (new response/attachment,
-- status back to SUBMITTED) instead of creating a new one. "Not Submitted" (per spec §9) is
-- simply the absence of a row here, not a stored status. Admin action history (who reviewed
-- it and when) is covered by the existing admin_action_logs table, same as every other admin
-- action in this app — no separate review-history table needed.
CREATE TABLE assignment_submissions (
    id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES assignments (id) ON DELETE CASCADE,
    student_id BIGINT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    response_text TEXT,
    attachment_url VARCHAR(1000),
    attachment_public_id VARCHAR(500),
    attachment_filename VARCHAR(255),
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    submitted_at TIMESTAMP NOT NULL,
    score INTEGER,
    feedback TEXT,
    reviewed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (assignment_id, student_id)
);
CREATE INDEX idx_assignment_submissions_assignment_id ON assignment_submissions (assignment_id);
