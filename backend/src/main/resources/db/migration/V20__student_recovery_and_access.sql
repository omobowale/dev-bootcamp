ALTER TABLE students ADD COLUMN recovery_token_hash VARCHAR(64) UNIQUE,
 ADD COLUMN recovery_expires_at TIMESTAMPTZ, ADD COLUMN recovery_requested_at TIMESTAMPTZ,
 ADD COLUMN login_suspended BOOLEAN NOT NULL DEFAULT false, ADD COLUMN auth_version BIGINT NOT NULL DEFAULT 0;
ALTER TABLE course_enrollments ADD COLUMN active BOOLEAN NOT NULL DEFAULT true;
