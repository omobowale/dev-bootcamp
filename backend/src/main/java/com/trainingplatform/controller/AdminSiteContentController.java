package com.trainingplatform.controller;
import com.trainingplatform.dto.SiteContentDocument;
import com.trainingplatform.service.SiteContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/admin/site-content") @RequiredArgsConstructor
public class AdminSiteContentController {
    private final SiteContentService service;
    @GetMapping public SiteContentDocument get() { return service.getAdmin(); }
    @PutMapping public SiteContentDocument save(@Valid @RequestBody SiteContentDocument request) { return service.save(request); }
}
