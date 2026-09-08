-- Phase 9: gated full lesson content, kept deliberately separate from course_topics (which stays
-- the public marketing teaser — see 09_LMS_Implementation_Plan.md). A ClassSession optionally
-- points at the CourseTopic it corresponds to, but is its own gated entity: only an enrolled
-- student can read it.
CREATE TABLE class_sessions (
    id BIGSERIAL PRIMARY KEY,
    module_id BIGINT NOT NULL REFERENCES course_modules (id) ON DELETE CASCADE,
    topic_id BIGINT REFERENCES course_topics (id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    objectives TEXT,
    scheduled_at TIMESTAMPTZ,
    meeting_link VARCHAR(1000),
    recording_url VARCHAR(1000),
    position INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (module_id, position)
);

CREATE INDEX idx_class_sessions_module_id ON class_sessions (module_id);
CREATE INDEX idx_class_sessions_topic_id ON class_sessions (topic_id);

-- Ordered rich-text body blocks within a class session. Modeled the same way as
-- course_included_items (V8): a real child table with its own surrogate key, mapped as a JPA
-- @ElementCollection ordered by @OrderBy("position") rather than @OrderColumn (see
-- CourseIncludedItem's javadoc for why) — always authored and saved together with the parent
-- class session, never independently, so no separate CRUD surface is needed.
CREATE TABLE lesson_sections (
    id BIGSERIAL PRIMARY KEY,
    class_session_id BIGINT NOT NULL REFERENCES class_sessions (id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    UNIQUE (class_session_id, position)
);

CREATE INDEX idx_lesson_sections_class_session_id ON lesson_sections (class_session_id);
