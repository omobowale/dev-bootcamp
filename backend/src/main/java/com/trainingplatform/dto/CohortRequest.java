package com.trainingplatform.dto;

import com.trainingplatform.entity.CohortStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record CohortRequest(
        @NotBlank String name,
        LocalDate startDate,
        LocalDate endDate,
        String schedule,
        String time,
        String mode,
        String location,
        @Min(value = 1, message = "Capacity must be at least 1") Integer capacity,
        CohortStatus status,
        boolean privateTutorial) {
}
