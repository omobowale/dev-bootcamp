package com.trainingplatform.dto;

import com.trainingplatform.entity.ClassSession;
import java.time.Instant;

public record StudentClassListItemResponse(
        Long id, Long moduleId, String moduleTitle, String title, Integer position, Instant scheduledAt) {

    public static StudentClassListItemResponse from(ClassSession session) {
        return new StudentClassListItemResponse(
                session.getId(),
                session.getModule().getId(),
                session.getModule().getTitle(),
                session.getTitle(),
                session.getPosition(),
                session.getScheduledAt());
    }
}
