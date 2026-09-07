package com.trainingplatform.service;

import com.trainingplatform.dto.TermsResponse;
import com.trainingplatform.dto.TermsUpdateRequest;
import com.trainingplatform.entity.SiteSettings;
import com.trainingplatform.repository.SiteSettingsRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {

    private final SiteSettingsRepository siteSettingsRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public TermsResponse getTerms() {
        return TermsResponse.from(getOrCreate());
    }

    @Transactional
    public TermsResponse updateTerms(TermsUpdateRequest request) {
        SiteSettings settings = getOrCreate();
        settings.setTermsContent(request.content());
        settings = siteSettingsRepository.save(settings);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "SiteSettings", settings.getId());
        return TermsResponse.from(settings);
    }

    // The V5 migration seeds row id=1, but getOrCreate keeps this service safe even against an
    // empty table (e.g. a test database that skips seed data).
    private SiteSettings getOrCreate() {
        return siteSettingsRepository.findById(SiteSettings.SINGLETON_ID).orElseGet(() -> {
            SiteSettings settings = new SiteSettings();
            settings.setId(SiteSettings.SINGLETON_ID);
            settings.setTermsContent("<p>Terms &amp; conditions coming soon.</p>");
            return siteSettingsRepository.save(settings);
        });
    }
}
