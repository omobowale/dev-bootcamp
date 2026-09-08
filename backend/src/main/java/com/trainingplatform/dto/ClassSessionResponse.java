package com.trainingplatform.dto;

import com.trainingplatform.entity.ClassSession;
import java.time.Instant;
import java.util.List;

public record ClassSessionResponse(
        Long id,
        Long moduleId,
        Long topicId,
        String title,
        String objectives,
        Instant scheduledAt,
        String meetingLink,
        String recordingUrl,
        Integer position,
        List<LessonSectionDto> sections) {

    public static ClassSessionResponse from(ClassSession session) {
        return new ClassSessionResponse(
                session.getId(),
                session.getModule().getId(),
                session.getTopic() != null ? session.getTopic().getId() : null,
                session.getTitle(),
                session.getObjectives(),
                session.getScheduledAt(),
                session.getMeetingLink(),
                session.getRecordingUrl(),
                session.getPosition(),
                session.getSections().stream().map(LessonSectionDto::from).toList());
    }
}
