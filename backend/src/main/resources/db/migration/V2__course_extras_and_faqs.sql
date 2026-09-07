-- The original spec (PRD) requires Instructor, Projects and FAQ content on the course detail
-- page, but the DB spec never modeled any of it. Adding the minimum needed to render Phase 3.

ALTER TABLE courses
    ADD COLUMN instructor_name VARCHAR(255),
    ADD COLUMN instructor_bio TEXT,
    ADD COLUMN instructor_avatar_url VARCHAR(500),
    ADD COLUMN projects TEXT;

CREATE TABLE faqs (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT REFERENCES courses (id) ON DELETE CASCADE,
    question VARCHAR(500) NOT NULL,
    answer TEXT NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX idx_faqs_course_id ON faqs (course_id);
