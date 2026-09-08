package com.trainingplatform.dto;

import com.trainingplatform.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public record AttendanceEntry(
        @NotNull Long studentId,
        @NotNull AttendanceStatus status,
        Instant checkInTime,
        Instant checkOutTime,
        String notes) {
}
