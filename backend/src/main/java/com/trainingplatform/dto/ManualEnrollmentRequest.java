package com.trainingplatform.dto;

import com.trainingplatform.entity.ExperienceLevel;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * For enrolling a student outside the public registration form — someone who registered by
 * phone, WhatsApp, or in person. Skips the cohort open/capacity checks a public registration
 * enforces (an admin taking this deliberate, out-of-band action is trusted to know what they're
 * doing), but still checks for an existing registration on the same email+cohort to avoid
 * accidental duplicates.
 */
public record ManualEnrollmentRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        String whatsappNumber,
        @NotNull Long courseId,
        @NotNull Long cohortId,
        ExperienceLevel experienceLevel,
        String preferredTime) {
}
