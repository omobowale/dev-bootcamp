package com.trainingplatform.dto;

import jakarta.validation.constraints.NotBlank;

public record MaterialUpdateRequest(@NotBlank String title, String description) {
}
