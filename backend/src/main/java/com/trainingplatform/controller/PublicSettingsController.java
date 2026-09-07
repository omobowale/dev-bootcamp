package com.trainingplatform.controller;

import com.trainingplatform.dto.TermsResponse;
import com.trainingplatform.service.SiteSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SiteSettingsService siteSettingsService;

    @GetMapping("/terms")
    public TermsResponse terms() {
        return siteSettingsService.getTerms();
    }
}
