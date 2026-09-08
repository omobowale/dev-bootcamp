ALTER TABLE assignment_submissions ADD COLUMN version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE quiz_attempts ADD COLUMN draft_answers TEXT;
