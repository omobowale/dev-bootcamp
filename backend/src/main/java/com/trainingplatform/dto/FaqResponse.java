package com.trainingplatform.dto;

import com.trainingplatform.entity.Faq;

public record FaqResponse(Long id, Long courseId, String question, String answer, Integer position) {

    public static FaqResponse from(Faq faq) {
        return new FaqResponse(
                faq.getId(),
                faq.getCourse() != null ? faq.getCourse().getId() : null,
                faq.getQuestion(),
                faq.getAnswer(),
                faq.getPosition());
    }
}
