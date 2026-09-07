-- The PRD requires a Consent field on the registration form, but the Database Spec
-- never modeled it. Adding it so consent is actually recorded, not just checked client-side.
ALTER TABLE registrations
    ADD COLUMN consent_given BOOLEAN NOT NULL DEFAULT FALSE;

-- Backs unique, gap-free registration number generation (REG-<year>-<sequence>),
-- e.g. REG-2026-00124 per the example in the Database Spec.
CREATE SEQUENCE registration_number_seq START WITH 1 INCREMENT BY 1;
