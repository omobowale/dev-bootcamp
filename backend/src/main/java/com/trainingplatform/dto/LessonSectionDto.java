package com.trainingplatform.dto;

import com.trainingplatform.entity.LessonSection;
import jakarta.validation.constraints.NotBlank;

public record LessonSectionDto(@NotBlank String title, String body) {

    public static LessonSectionDto from(LessonSection section) {
        return new LessonSectionDto(section.getTitle(), section.getBody());
    }

    public LessonSection toEntity(int position) {
        return new LessonSection(title(), body(), position);
    }
}
