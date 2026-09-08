package com.trainingplatform.dto;

import com.trainingplatform.entity.CourseModule;
import java.util.List;

public record ModuleResponse(
        Long id,
        Long courseId,
        String title,
        String description,
        Integer position,
        List<TopicResponse> topics,
        List<ClassSessionResponse> classSessions) {

    public static ModuleResponse from(
            CourseModule module, List<TopicResponse> topics, List<ClassSessionResponse> classSessions) {
        return new ModuleResponse(
                module.getId(),
                module.getCourse().getId(),
                module.getTitle(),
                module.getDescription(),
                module.getPosition(),
                topics,
                classSessions);
    }
}
