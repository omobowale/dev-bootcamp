package com.trainingplatform.dto;

import com.trainingplatform.entity.RegistrationStatus;
import jakarta.validation.constraints.NotNull;

public record RegistrationStatusUpdateRequest(@NotNull RegistrationStatus status) {
}
