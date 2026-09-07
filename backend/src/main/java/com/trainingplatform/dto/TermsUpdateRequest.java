package com.trainingplatform.dto;

import jakarta.validation.constraints.NotBlank;

public record TermsUpdateRequest(@NotBlank String content) {
}
