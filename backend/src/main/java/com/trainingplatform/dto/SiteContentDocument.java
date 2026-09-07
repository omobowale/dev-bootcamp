package com.trainingplatform.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
public record SiteContentDocument(@PositiveOrZero long version, @NotNull @Valid SiteContentData content) {}
