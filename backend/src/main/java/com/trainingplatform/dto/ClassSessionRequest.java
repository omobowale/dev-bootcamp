package com.trainingplatform.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.List;

public record ClassSessionRequest(
        @NotBlank String title,
        String objectives,
        Long topicId,
        Long cohortId,
        Instant scheduledAt,
        String meetingLink,
        String recordingUrl,
        @NotNull Integer position,
        @Valid List<LessonSectionDto> sections) {
}
