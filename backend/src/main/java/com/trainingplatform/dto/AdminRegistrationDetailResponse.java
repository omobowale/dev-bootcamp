package com.trainingplatform.dto;

import com.trainingplatform.entity.Registration;
import java.time.Instant;

public record AdminRegistrationDetailResponse(
        Long id,
        String registrationNumber,
        String fullName,
        String email,
        String whatsappNumber,
        Long courseId,
        String courseTitle,
        Long cohortId,
        String cohortName,
        boolean privateTutorial,
        String preferredTime,
        String experienceLevel,
        String referralSource,
        boolean consentGiven,
        String status,
        Instant createdAt,
        Instant updatedAt) {

    public static AdminRegistrationDetailResponse from(Registration registration) {
        return new AdminRegistrationDetailResponse(
                registration.getId(),
                registration.getRegistrationNumber(),
                registration.getFullName(),
                registration.getEmail(),
                registration.getWhatsappNumber(),
                registration.getCourse().getId(),
                registration.getCourse().getTitle(),
                registration.getCohort().getId(),
                registration.getCohort().getName(),
                registration.getCohort().isPrivateTutorial(),
                registration.getPreferredTime(),
                registration.getExperienceLevel() != null ? registration.getExperienceLevel().name() : null,
                registration.getReferralSource(),
                registration.isConsentGiven(),
                registration.getStatus().name(),
                registration.getCreatedAt(),
                registration.getUpdatedAt());
    }
}
