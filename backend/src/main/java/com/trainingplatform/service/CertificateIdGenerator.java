package com.trainingplatform.service;

import java.time.Year;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Generates certificate verification IDs like CERT-2026-00042 — same DB-sequence-for-atomicity
 * approach as RegistrationNumberGenerator/StudentIdGenerator, and deliberately mirrors their format.
 */
@Component
public class CertificateIdGenerator {

    private final JdbcTemplate jdbcTemplate;

    public CertificateIdGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String next() {
        Long sequenceValue = jdbcTemplate.queryForObject("SELECT nextval('certificate_id_seq')", Long.class);
        return "CERT-%d-%05d".formatted(Year.now().getValue(), sequenceValue);
    }
}
