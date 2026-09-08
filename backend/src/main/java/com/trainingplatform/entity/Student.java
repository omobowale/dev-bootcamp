package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

/**
 * A student's login account — created automatically the first time one of their registrations
 * is marked CONFIRMED (see StudentEnrollmentService), never via public signup. One Student can
 * go on to hold multiple CourseEnrollments (a repeat customer registering for a second course
 * gets a second enrollment on this same account, matched by email).
 */
@Getter
@Setter
@Entity
@Table(name = "students")
public class Student extends BaseEntity {

    @Column(name = "student_id", nullable = false, unique = true)
    private String studentId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    /** Null until the student accepts their invite and sets a password. */
    @Column(name = "password_hash")
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudentStatus status = StudentStatus.INVITED;

    @Column(name = "invite_token", unique = true)
    private String inviteToken;

    @Column(name = "invite_token_expires_at")
    private Instant inviteTokenExpiresAt;
}
