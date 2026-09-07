package com.trainingplatform.dto;

import com.trainingplatform.entity.CourseTopic;

public record TopicResponse(Long id, Long moduleId, String title, Integer position) {

    public static TopicResponse from(CourseTopic topic) {
        return new TopicResponse(topic.getId(), topic.getModule().getId(), topic.getTitle(), topic.getPosition());
    }
}
