package com.trainingplatform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record BulkAttendanceRequest(@NotNull @Valid List<AttendanceEntry> entries) {
}
