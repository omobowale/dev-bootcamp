package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Configurable per-course completion criteria (spec §12). Absence of a row for a course means
 * "use these exact default values" — see StudentProgressService, which treats a missing row and
 * one with these defaults identically.
 */
@Getter
@Setter
@Entity
@Table(name = "course_completion_criteria")
public class CourseCompletionCriteria extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false, unique = true)
    private Course course;

    @Column(name = "require_all_classes_completed", nullable = false)
    private boolean requireAllClassesCompleted = true;

    @Column(name = "require_all_quizzes_passed", nullable = false)
    private boolean requireAllQuizzesPassed = false;

    @Column(name = "require_all_assignments_reviewed", nullable = false)
    private boolean requireAllAssignmentsReviewed = false;

    /** Null means no attendance requirement. */
    @Column(name = "min_attendance_percentage")
    private Integer minAttendancePercentage;
}
