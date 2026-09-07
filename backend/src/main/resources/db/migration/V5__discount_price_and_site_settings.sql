-- Discount pricing: `price` remains the main/regular price; `discount_price`, when set and
-- lower than `price`, is the promotional price shown to the public instead.
ALTER TABLE courses
    ADD COLUMN discount_price NUMERIC(10, 2);

-- Single-row table holding admin-editable site-wide legal content (currently just Terms &
-- Conditions). Modeled as its own table rather than a generic key/value settings blob because
-- there's exactly one such document today and a dedicated column is simplest; if more
-- admin-editable site content shows up later, that's the point to generalize.
CREATE TABLE site_settings (
    id BIGINT PRIMARY KEY,
    terms_content TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT now()
);

INSERT INTO site_settings (id, terms_content) VALUES (1, '<h3>1. Your registration</h3>
<p>Registering for a course or private tutorial through DevTraining is an expression of interest, not a binding contract. Our team will follow up with you on WhatsApp or email to confirm your spot, payment, and cohort schedule.</p>
<h3>2. Your contact information</h3>
<p>We collect your name, email address and WhatsApp number solely to manage your registration and keep you informed about your course &mdash; scheduling updates, payment instructions, and next steps. Your WhatsApp number is <strong>never used for marketing or shared with third parties</strong>; it exists so our team can reach you directly about the course you registered for.</p>
<h3>3. How long we keep your data</h3>
<p>We retain your registration details for as long as you remain enrolled in a course or cohort with us. If you are not enrolled in anything and would like your data removed sooner, contact us and we will action the request.</p>
<h3>4. Payments</h3>
<p>Pricing shown on the site is in Nigerian Naira (NGN) unless stated otherwise. Any discount price shown is time-limited at our discretion. Payment instructions are shared once your registration is confirmed by our team.</p>
<h3>5. Cohorts and scheduling</h3>
<p>All our training is delivered <strong>100% online</strong>. Group cohort dates and times are shared in advance; private tutorials are scheduled individually based on the preferred time you provide at registration, confirmed with you directly.</p>
<h3>6. Code of conduct</h3>
<p>We expect all students to engage respectfully with instructors and fellow students. We reserve the right to remove a student from a cohort for conduct that disrupts the learning environment for others.</p>
<h3>7. Changes to these terms</h3>
<p>We may update these terms from time to time as the platform evolves. The version shown here is always the current one.</p>
<p>Questions about any of this? Reach out to us and we are happy to explain further.</p>');
