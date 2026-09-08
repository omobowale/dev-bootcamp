package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

/**
 * Issued once a student's progress satisfies the course's {@link CourseCompletionCriteria} — see
 * spec §12. One per (student, course); {@code verificationId} is the identifier anyone (not just
 * the student) can use to check authenticity via the public verify endpoint.
 */
@Getter
@Setter
@Entity
@Table(name = "certificates")
public class Certificate extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "verification_id", nullable = false, unique = true, length = 20)
    private String verificationId;

    @Column(name = "completion_date", nullable = false)
    private LocalDate completionDate;
}
