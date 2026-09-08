package com.trainingplatform.dto;

import com.trainingplatform.entity.ClassSession;
import java.time.Instant;
import java.util.List;

public record StudentClassSessionResponse(
        Long id,
        String title,
        String objectives,
        Instant scheduledAt,
        String meetingLink,
        String recordingUrl,
        List<LessonSectionDto> sections) {

    public static StudentClassSessionResponse from(ClassSession session) {
        return new StudentClassSessionResponse(
                session.getId(),
                session.getTitle(),
                session.getObjectives(),
                session.getScheduledAt(),
                session.getMeetingLink(),
                session.getRecordingUrl(),
                session.getSections().stream().map(LessonSectionDto::from).toList());
    }
}
