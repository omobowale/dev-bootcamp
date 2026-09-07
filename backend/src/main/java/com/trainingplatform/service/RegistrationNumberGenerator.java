package com.trainingplatform.service;

import java.time.Year;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Generates registration numbers like REG-2026-00124 using a DB sequence for atomicity —
 * safe under concurrent registrations without relying on retry-on-conflict.
 */
@Component
public class RegistrationNumberGenerator {

    private final JdbcTemplate jdbcTemplate;

    public RegistrationNumberGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String next() {
        Long sequenceValue = jdbcTemplate.queryForObject("SELECT nextval('registration_number_seq')", Long.class);
        return "REG-%d-%05d".formatted(Year.now().getValue(), sequenceValue);
    }
}
