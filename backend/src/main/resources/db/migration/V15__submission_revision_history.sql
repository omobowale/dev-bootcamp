CREATE TABLE assignment_submission_revisions (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL REFERENCES assignment_submissions(id),
    snapshot TEXT NOT NULL,
    archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_submission_revisions_submission ON assignment_submission_revisions(submission_id);
