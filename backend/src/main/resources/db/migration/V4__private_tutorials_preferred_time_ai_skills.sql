-- Private tutorials: a cohort with no fixed shared schedule, representing a standing
-- "book a 1-on-1 session" option for a course. Scheduling itself stays manual (see
-- 06_Gaps_and_Open_Questions.md) — this just flags the cohort so the frontend can present it
-- differently and require a preferred-time note at registration.
ALTER TABLE cohorts
    ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE;

-- Free-text preferred time: required for private-tutorial registrations, optional (a note for
-- the admin) for group-cohort registrations.
ALTER TABLE registrations
    ADD COLUMN preferred_time VARCHAR(255);

-- Marketing/curriculum flag: this course's curriculum includes AI-assisted development /
-- prompting training, shown as a badge on the public course card and detail page.
ALTER TABLE courses
    ADD COLUMN ai_skills_included BOOLEAN NOT NULL DEFAULT FALSE;
