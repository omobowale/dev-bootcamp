-- "What's included" — a per-course checklist of concrete expectations shown on the public course
-- page (live class hours, materials, community access, certificate, etc). Free text, one item per
-- line, following the same convention as `courses.projects` (see `Course.java` and
-- `frontend/src/utils/text.ts#splitLines`) rather than a child table — it's an ordered list of
-- short strings scoped to one course with no need for independent CRUD or reordering endpoints.
ALTER TABLE courses
    ADD COLUMN whats_included TEXT;

-- Replaces the plain `ai_skills_included` boolean: AI skills differ meaningfully by course (AI-
-- assisted coding for a dev course, AI-assisted analysis for a data course, etc), so a fixed
-- "Curriculum includes AI & prompting training" label for every course undersold what's actually
-- being taught. A free-text description serves both roles — its presence means "this course
-- includes AI skills", and its content says which ones — so the boolean is retired rather than
-- kept alongside it as a second, potentially-drifting signal.
ALTER TABLE courses
    ADD COLUMN ai_skills_description VARCHAR(500);

UPDATE courses
SET ai_skills_description = 'AI-assisted coding — using tools like GitHub Copilot and ChatGPT to speed up development and debugging.'
WHERE ai_skills_included = TRUE;

ALTER TABLE courses
    DROP COLUMN ai_skills_included;

UPDATE courses
SET whats_included = 'Live classes
Course curriculum
Recorded sessions
Course materials
Assignments
Practical projects
Quizzes/assessments
WhatsApp community
Direct access to your instructor during the cohort
Final project
Certificate of completion';
