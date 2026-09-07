package com.trainingplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TopicRequest(@NotBlank String title, @NotNull Integer position) {
}
