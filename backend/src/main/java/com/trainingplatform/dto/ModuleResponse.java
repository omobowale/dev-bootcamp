package com.trainingplatform.dto;

import com.trainingplatform.entity.CourseModule;
import java.util.List;

public record ModuleResponse(
        Long id, Long courseId, String title, String description, Integer position, List<TopicResponse> topics) {

    public static ModuleResponse from(CourseModule module, List<TopicResponse> topics) {
        return new ModuleResponse(
                module.getId(),
                module.getCourse().getId(),
                module.getTitle(),
                module.getDescription(),
                module.getPosition(),
                topics);
    }
}
