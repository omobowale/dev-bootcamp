ALTER TABLE class_sessions ADD COLUMN cohort_id BIGINT REFERENCES cohorts(id);
CREATE INDEX idx_class_sessions_cohort ON class_sessions(cohort_id);
-- Unambiguous existing schedules can be assigned automatically. Other lessons stay shared.
UPDATE class_sessions s SET cohort_id=(SELECT min(c.id) FROM cohorts c JOIN course_modules m ON m.course_id=c.course_id WHERE m.id=s.module_id)
WHERE (SELECT count(*) FROM cohorts c JOIN course_modules m ON m.course_id=c.course_id WHERE m.id=s.module_id)=1;
