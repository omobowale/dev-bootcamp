-- Phase 13: certificates, issued once a student's progress satisfies the course's
-- CourseCompletionCriteria (see StudentProgressService). Verification ID follows the same
-- DB-sequence-for-atomicity pattern as registration numbers and student IDs.
CREATE SEQUENCE certificate_id_seq START 1;

CREATE TABLE certificates (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students (id) ON DELETE CASCADE,
    course_id BIGINT NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    verification_id VARCHAR(20) NOT NULL UNIQUE,
    completion_date DATE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (student_id, course_id)
);
CREATE INDEX idx_certificates_verification_id ON certificates (verification_id);
