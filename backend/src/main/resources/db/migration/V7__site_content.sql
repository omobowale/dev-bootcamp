CREATE TABLE site_content (
    id BIGINT PRIMARY KEY,
    version BIGINT NOT NULL DEFAULT 0,
    content TEXT NOT NULL
);
INSERT INTO site_content (id, version, content) VALUES (1, 0,
    '{"supportEmail":"","whatsappNumber":"","socialLinks":[],"testimonials":[],"team":[]}');
