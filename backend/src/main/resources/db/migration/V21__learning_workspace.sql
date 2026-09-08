CREATE TABLE assignment_drafts (
 student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 assignment_id BIGINT NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
 response_text TEXT NOT NULL DEFAULT '', version BIGINT NOT NULL DEFAULT 1,
 submission_version BIGINT NOT NULL DEFAULT -1, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(student_id,assignment_id)
);
CREATE TABLE student_notification_reads (
 student_id BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
 notification_key VARCHAR(200) NOT NULL, read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 PRIMARY KEY(student_id,notification_key)
);
CREATE TABLE student_reminder_preferences (
 student_id BIGINT PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
 enabled BOOLEAN NOT NULL DEFAULT true, hours_before INTEGER NOT NULL DEFAULT 24
 CHECK(hours_before IN (1,6,24,48,168))
);
ALTER TABLE assignments ADD COLUMN rubric_criteria TEXT, ADD COLUMN rubric_version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE assignment_submissions ADD COLUMN rubric_breakdown TEXT;
