package com.trainingplatform.service;

import com.trainingplatform.dto.SiteContentData;
import com.trainingplatform.dto.SiteContentDocument;
import com.trainingplatform.entity.SiteContent;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ConflictException;
import com.trainingplatform.repository.SiteContentRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.net.URI;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.ObjectMapper;

@Service @RequiredArgsConstructor
public class SiteContentService {
    private final SiteContentRepository repository;
    private final ObjectMapper mapper;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService logs;

    @Transactional(readOnly = true)
    public SiteContentDocument getAdmin() { return document(get()); }

    @Transactional(readOnly = true)
    public SiteContentData getPublic() {
        SiteContentData data = document(get()).content();
        return new SiteContentData(data.supportEmail(), data.whatsappNumber(),
                data.socialLinks().stream().filter(SiteContentData.SocialLink::published).toList(),
                data.testimonials().stream().filter(SiteContentData.Testimonial::published).toList(),
                data.team().stream().filter(SiteContentData.TeamMember::published).toList());
    }

    @Transactional
    public SiteContentDocument save(SiteContentDocument request) {
        SiteContent entity = get();
        if (entity.getVersion() != request.version()) throw new ConflictException("Site content changed in another session. Reload before saving.");
        SiteContentData data = request.content();
        data.socialLinks().forEach(item -> validateUrl(item.url(), false));
        data.testimonials().forEach(item -> validateUrl(item.avatarUrl(), true));
        data.team().forEach(item -> { validateUrl(item.avatarUrl(), true); validateUrl(item.profileUrl(), true); });
        entity.setContent(mapper.writeValueAsString(data));
        repository.saveAndFlush(entity);
        logs.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "SiteContent", entity.getId());
        return document(entity);
    }

    static void validateUrl(String value, boolean optional) {
        if (optional && (value == null || value.isBlank())) return;
        try {
            URI uri = URI.create(value);
            if (!("https".equalsIgnoreCase(uri.getScheme()) || "http".equalsIgnoreCase(uri.getScheme())) || uri.getHost() == null || uri.getUserInfo() != null) throw new IllegalArgumentException();
        } catch (IllegalArgumentException ex) { throw new BadRequestException("Links and images must use a valid http or https URL."); }
    }
    private SiteContent get() { return repository.findById(1L).orElseThrow(() -> new IllegalStateException("Site content migration is missing")); }
    private SiteContentDocument document(SiteContent entity) { return new SiteContentDocument(entity.getVersion(), mapper.readValue(entity.getContent(), SiteContentData.class)); }
}
