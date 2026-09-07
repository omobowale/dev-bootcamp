package com.trainingplatform.controller;

import com.trainingplatform.dto.FaqResponse;
import com.trainingplatform.service.FaqService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class PublicFaqController {

    private final FaqService faqService;

    @GetMapping
    public List<FaqResponse> globalFaqs() {
        return faqService.findGlobal();
    }
}
