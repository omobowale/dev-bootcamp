package com.trainingplatform.dto;

import com.trainingplatform.entity.CourseIncludedItem;
import jakarta.validation.constraints.NotBlank;

public record IncludedItemDto(@NotBlank String title, String description) {

    public static IncludedItemDto from(CourseIncludedItem item) {
        return new IncludedItemDto(item.getTitle(), item.getDescription());
    }

    public CourseIncludedItem toEntity(int position) {
        return new CourseIncludedItem(title(), description(), position);
    }
}
