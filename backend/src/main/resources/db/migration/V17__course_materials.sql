CREATE TABLE course_materials (
    id BIGSERIAL PRIMARY KEY,
    class_session_id BIGINT NOT NULL REFERENCES class_sessions (id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_url VARCHAR(1000) NOT NULL,
    file_public_id VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    updated_at TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (class_session_id, position)
);

CREATE INDEX idx_course_materials_class_session ON course_materials (class_session_id);
