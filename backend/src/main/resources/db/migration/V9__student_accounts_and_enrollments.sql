-- Phase 8 of the LMS expansion (see 09_LMS_Implementation_Plan.md): student accounts and
-- course enrollments. A student is created the moment an admin marks a Registration CONFIRMED
-- (see StudentEnrollmentService) — there is no public student signup, mirroring how admin
-- accounts work today.
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'INVITED',
    invite_token VARCHAR(255) UNIQUE,
    invite_token_expires_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Same pattern as registration_number_seq — a DB sequence keeps Student ID assignment atomic
-- under concurrent enrollments without retry-on-conflict logic.
CREATE SEQUENCE student_id_seq START 1;

-- One row per (student, course, cohort) the student has been enrolled into. Tied back to the
-- Registration that caused it (unique — a registration produces at most one enrollment) so the
-- enrollment always has a clear audit trail to the original interest/payment confirmation.
CREATE TABLE course_enrollments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL REFERENCES students (id),
    course_id BIGINT NOT NULL REFERENCES courses (id),
    cohort_id BIGINT NOT NULL REFERENCES cohorts (id),
    registration_id BIGINT NOT NULL UNIQUE REFERENCES registrations (id),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_course_enrollments_student_id ON course_enrollments (student_id);
CREATE INDEX idx_students_email ON students (email);
