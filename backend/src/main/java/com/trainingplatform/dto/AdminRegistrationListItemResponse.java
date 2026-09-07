package com.trainingplatform.dto;

import com.trainingplatform.entity.Registration;
import java.time.Instant;

public record AdminRegistrationListItemResponse(
        Long id,
        String registrationNumber,
        String fullName,
        String email,
        String courseTitle,
        String cohortName,
        boolean privateTutorial,
        String status,
        Instant createdAt) {

    public static AdminRegistrationListItemResponse from(Registration registration) {
        return new AdminRegistrationListItemResponse(
                registration.getId(),
                registration.getRegistrationNumber(),
                registration.getFullName(),
                registration.getEmail(),
                registration.getCourse().getTitle(),
                registration.getCohort().getName(),
                registration.getCohort().isPrivateTutorial(),
                registration.getStatus().name(),
                registration.getCreatedAt());
    }
}
