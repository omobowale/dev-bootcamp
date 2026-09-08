package com.trainingplatform.service;

import java.time.Year;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Generates Student IDs like STU-2026-00124 — same DB-sequence-for-atomicity approach as
 * RegistrationNumberGenerator, and deliberately mirrors its format.
 */
@Component
public class StudentIdGenerator {

    private final JdbcTemplate jdbcTemplate;

    public StudentIdGenerator(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String next() {
        Long sequenceValue = jdbcTemplate.queryForObject("SELECT nextval('student_id_seq')", Long.class);
        return "STU-%d-%05d".formatted(Year.now().getValue(), sequenceValue);
    }
}
