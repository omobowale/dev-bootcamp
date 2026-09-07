package com.trainingplatform.dto;

import com.trainingplatform.entity.Registration;

public record RegistrationResponse(
        String registrationNumber,
        String fullName,
        String email,
        String courseTitle,
        String cohortName,
        String status,
        boolean privateTutorial,
        String preferredTime) {

    public static RegistrationResponse from(Registration registration) {
        return new RegistrationResponse(
                registration.getRegistrationNumber(),
                registration.getFullName(),
                registration.getEmail(),
                registration.getCourse().getTitle(),
                registration.getCohort().getName(),
                registration.getStatus().name(),
                registration.getCohort().isPrivateTutorial(),
                registration.getPreferredTime());
    }
}
