-- Rebrand: "DevTraining" -> "Bukiva Learn". V5's seeded Terms & Conditions is already applied in
-- every environment that ran it, so it can't be edited in place without breaking Flyway's checksum
-- validation — update the row's content instead.
UPDATE site_settings
SET terms_content = replace(terms_content, 'DevTraining', 'Bukiva Learn'),
    updated_at = now()
WHERE id = 1;
