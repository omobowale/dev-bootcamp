-- Replaces the free-text, one-line-per-item `courses.whats_included` with a proper per-item
-- title + description, so an admin can say *why* "Live classes" matters, not just list it. A
-- real child table (like course_modules/course_topics/faqs) rather than another delimited-text
-- field, since each row now carries two pieces of data instead of one.
CREATE TABLE course_included_items (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT NOT NULL REFERENCES courses (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    UNIQUE (course_id, position)
);

CREATE INDEX idx_course_included_items_course_id ON course_included_items (course_id);

-- Backfill: the demo courses share the same 11-item starter checklist (see
-- V6__whats_included_and_ai_skills_description.sql) — give each item a real description here
-- rather than leaving every course's items description-less after the migration.
INSERT INTO course_included_items (course_id, position, title, description)
SELECT courses.id, item.position, item.title, item.description
FROM courses
CROSS JOIN (VALUES
    (1, 'Live classes', 'Interactive sessions with your instructor, several times a week.'),
    (2, 'Course curriculum', 'A structured path through everything you need to learn, module by module.'),
    (3, 'Recorded sessions', 'Missed a class? Catch up anytime with full session recordings.'),
    (4, 'Course materials', 'Slides, code samples, and reference guides to keep for the long run.'),
    (5, 'Assignments', 'Hands-on exercises after every module to lock in what you''ve learned.'),
    (6, 'Practical projects', 'Real projects for your portfolio, not just toy examples.'),
    (7, 'Quizzes/assessments', 'Quick checks to make sure concepts are actually sticking.'),
    (8, 'WhatsApp community', 'A group chat with fellow students and instructors for support along the way.'),
    (9, 'Direct access to your instructor during the cohort', 'Ask questions and get feedback directly from your instructor.'),
    (10, 'Final project', 'A capstone project that ties everything together.'),
    (11, 'Certificate of completion', 'A shareable certificate once you''ve finished the course.')
) AS item(position, title, description)
WHERE courses.whats_included IS NOT NULL;

ALTER TABLE courses
    DROP COLUMN whats_included;
