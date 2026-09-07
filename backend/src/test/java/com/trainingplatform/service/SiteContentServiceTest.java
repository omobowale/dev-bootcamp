package com.trainingplatform.service;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;
import com.trainingplatform.dto.*;
import com.trainingplatform.entity.SiteContent;
import com.trainingplatform.exception.*;
import com.trainingplatform.repository.SiteContentRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.ObjectMapper;

class SiteContentServiceTest {
    private final SiteContentRepository repository = mock(SiteContentRepository.class);
    private final ObjectMapper mapper = new ObjectMapper();
    private final SiteContentService service = new SiteContentService(repository, mapper, mock(CurrentAdminProvider.class), mock(AdminActionLogService.class));
    private SiteContent seed(SiteContentData data) {
        SiteContent entity = new SiteContent(); entity.setId(1L); entity.setVersion(3L); entity.setContent(mapper.writeValueAsString(data));
        when(repository.findById(1L)).thenReturn(Optional.of(entity)); return entity;
    }
    private SiteContentData sample() {
        return new SiteContentData("hello@example.com", "2348000000000",
                List.of(new SiteContentData.SocialLink("Visible", "https://example.com", true), new SiteContentData.SocialLink("Draft", "https://example.com/draft", false)),
                List.of(new SiteContentData.Testimonial("Learner", "Course", "A real quote", "", true), new SiteContentData.Testimonial("Draft learner", "", "Not published", "", false)),
                List.of(new SiteContentData.TeamMember("Instructor", "Engineer", "Bio", "", "", true, true), new SiteContentData.TeamMember("Draft person", "Engineer", "Bio", "", "", false, false)));
    }
    @Test void publicContentNeverIncludesDrafts() {
        seed(sample()); SiteContentData data = service.getPublic();
        assertThat(data.socialLinks()).extracting(SiteContentData.SocialLink::platform).containsExactly("Visible");
        assertThat(data.testimonials()).hasSize(1); assertThat(data.team()).hasSize(1);
        assertThat(service.getAdmin().content().testimonials()).hasSize(2);
    }
    @Test void staleEditsCannotOverwriteNewerContent() {
        seed(sample());
        assertThatThrownBy(() -> service.save(new SiteContentDocument(2, sample()))).isInstanceOf(ConflictException.class);
        verify(repository, never()).saveAndFlush(any());
    }
    @Test void rejectsUnsafeLinksButAllowsEmptyOptionalPortraits() {
        for (String url : List.of("javascript:alert(1)", "data:text/html,test", "//example.com", "https://user:password@example.com"))
            assertThatThrownBy(() -> SiteContentService.validateUrl(url, false)).isInstanceOf(BadRequestException.class);
        assertThatCode(() -> SiteContentService.validateUrl("", true)).doesNotThrowAnyException();
        assertThatCode(() -> SiteContentService.validateUrl("https://example.com/profile", false)).doesNotThrowAnyException();
    }
    @Test void savesValidContentAndReturnsItsVersion() {
        SiteContent entity = seed(sample());
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> { entity.setVersion(4L); return entity; });
        assertThat(service.save(new SiteContentDocument(3, sample())).version()).isEqualTo(4);
    }
}
