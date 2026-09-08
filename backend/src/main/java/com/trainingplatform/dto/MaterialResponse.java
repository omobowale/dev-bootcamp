package com.trainingplatform.dto;

import com.trainingplatform.entity.CourseMaterial;

public record MaterialResponse(
        Long id, String title, String description, String fileUrl, String fileName, Integer position) {

    public static MaterialResponse from(CourseMaterial material) {
        return new MaterialResponse(
                material.getId(),
                material.getTitle(),
                material.getDescription(),
                material.getFileUrl(),
                material.getFileName(),
                material.getPosition());
    }
}
