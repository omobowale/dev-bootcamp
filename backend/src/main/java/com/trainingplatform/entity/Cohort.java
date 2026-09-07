package com.trainingplatform.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "cohorts")
public class Cohort extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String name;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    private String schedule;

    private String time;

    private String mode;

    private String location;

    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CohortStatus status = CohortStatus.OPEN;

    /**
     * A private cohort has no fixed shared schedule — it's a standing "book a 1-on-1 tutorial"
     * slot for the course. Registering against one requires a preferred-time note (see
     * Registration.preferredTime); scheduling itself stays a manual, human follow-up rather than
     * a real booking system — see 06_Gaps_and_Open_Questions.md.
     */
    @Column(name = "is_private", nullable = false)
    private boolean privateTutorial = false;
}
