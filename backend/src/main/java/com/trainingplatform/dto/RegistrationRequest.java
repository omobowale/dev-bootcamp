package com.trainingplatform.dto;

import com.trainingplatform.entity.ExperienceLevel;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegistrationRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank String whatsappNumber,
        @NotNull Long courseId,
        @NotNull Long cohortId,
        ExperienceLevel experienceLevel,
        String referralSource,
        @AssertTrue(message = "Consent is required to register") boolean consentGiven,
        String preferredTime) {
}
