package com.trainingplatform.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * A student's active access to one course/cohort, created the moment their Registration is
 * marked CONFIRMED (see StudentEnrollmentService) — never created directly. Kept minimal for
 * now; completion tracking (Phase 12) will add status/progress fields when that's actually
 * being built, not before.
 */
@Getter
@Setter
@Entity
@Table(name = "course_enrollments")
public class CourseEnrollment extends BaseEntity {
    private boolean active = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cohort_id", nullable = false)
    private Cohort cohort;

    /** The registration that caused this enrollment — one registration produces at most one. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private Registration registration;
}
