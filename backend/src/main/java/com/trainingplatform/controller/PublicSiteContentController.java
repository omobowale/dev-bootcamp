package com.trainingplatform.controller;
import com.trainingplatform.dto.SiteContentData;
import com.trainingplatform.service.SiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/site-content") @RequiredArgsConstructor
public class PublicSiteContentController {
    private final SiteContentService service;
    @GetMapping public SiteContentData get() { return service.getPublic(); }
}
