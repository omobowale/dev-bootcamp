package com.trainingplatform.controller;

import com.trainingplatform.dto.FaqRequest;
import com.trainingplatform.dto.FaqResponse;
import com.trainingplatform.service.FaqService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/faqs")
@RequiredArgsConstructor
public class AdminFaqController {

    private final FaqService faqService;

    @GetMapping
    public List<FaqResponse> list(@RequestParam(required = false) Long courseId) {
        return courseId == null ? faqService.findGlobal() : faqService.findByCourse(courseId);
    }

    @PostMapping
    public FaqResponse create(@Valid @RequestBody FaqRequest request) {
        return faqService.create(request);
    }

    @PutMapping("/{id}")
    public FaqResponse update(@PathVariable Long id, @Valid @RequestBody FaqRequest request) {
        return faqService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        faqService.delete(id);
    }
}
