package com.trainingplatform.dto;

import com.trainingplatform.entity.CourseEnrollment;
import java.time.Instant;

public record StudentEnrollmentResponse(
        Long courseId,
        String courseTitle,
        String courseSlug,
        String courseImage,
        Long cohortId,
        String cohortName,
        boolean privateTutorial,
        Instant enrolledAt) {

    public static StudentEnrollmentResponse from(CourseEnrollment enrollment) {
        return new StudentEnrollmentResponse(
                enrollment.getCourse().getId(),
                enrollment.getCourse().getTitle(),
                enrollment.getCourse().getSlug(),
                enrollment.getCourse().getImage(),
                enrollment.getCohort().getId(),
                enrollment.getCohort().getName(),
                enrollment.getCohort().isPrivateTutorial(),
                enrollment.getCreatedAt());
    }
}
