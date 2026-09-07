package com.trainingplatform.controller;

import com.trainingplatform.dto.TermsResponse;
import com.trainingplatform.dto.TermsUpdateRequest;
import com.trainingplatform.service.SiteSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SiteSettingsService siteSettingsService;

    @GetMapping("/terms")
    public TermsResponse terms() {
        return siteSettingsService.getTerms();
    }

    @PutMapping("/terms")
    public TermsResponse updateTerms(@Valid @RequestBody TermsUpdateRequest request) {
        return siteSettingsService.updateTerms(request);
    }
}
