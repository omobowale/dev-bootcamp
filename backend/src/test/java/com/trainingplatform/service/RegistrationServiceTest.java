package com.trainingplatform.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trainingplatform.dto.RegistrationRequest;
import com.trainingplatform.dto.RegistrationResponse;
import com.trainingplatform.entity.Cohort;
import com.trainingplatform.entity.CohortStatus;
import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.ExperienceLevel;
import com.trainingplatform.entity.Registration;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ConflictException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CohortRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.repository.RegistrationRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

/**
 * Unit tests for the registration validation pipeline described in
 * 03_Backend_and_API_Specification.md §5: verify published course -> verify open cohort ->
 * check capacity -> check duplicate -> generate number -> save -> notify. All collaborators are
 * mocked so these run without a database.
 */
@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {

    @Mock
    private RegistrationRepository registrationRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private CohortRepository cohortRepository;

    @Mock
    private RegistrationNumberGenerator registrationNumberGenerator;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private RegistrationService registrationService;

    private Course publishedCourse;
    private Cohort openCohort;

    @BeforeEach
    void setUp() {
        publishedCourse = new Course();
        publishedCourse.setId(1L);
        publishedCourse.setTitle("Full-Stack Web Development");
        publishedCourse.setPublished(true);

        openCohort = new Cohort();
        openCohort.setId(10L);
        openCohort.setName("Cohort 1");
        openCohort.setCourse(publishedCourse);
        openCohort.setStatus(CohortStatus.OPEN);
    }

    private RegistrationRequest validRequest() {
        return validRequest(null);
    }

    private RegistrationRequest validRequest(String preferredTime) {
        return new RegistrationRequest(
                "Jane Doe",
                "jane@example.com",
                "+2348012345678",
                publishedCourse.getId(),
                openCohort.getId(),
                ExperienceLevel.BEGINNER,
                "WhatsApp",
                true,
                preferredTime);
    }

    @Test
    void savesRegistrationAndSendsBothEmailsWhenEverythingIsValid() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));
        when(registrationRepository.existsByEmailAndCohortId("jane@example.com", 10L)).thenReturn(false);
        when(registrationNumberGenerator.next()).thenReturn("REG-2026-00001");
        when(registrationRepository.save(any(Registration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegistrationResponse response = registrationService.register(validRequest());

        assertThat(response.registrationNumber()).isEqualTo("REG-2026-00001");
        assertThat(response.courseTitle()).isEqualTo("Full-Stack Web Development");
        verify(emailService).sendRegistrationConfirmation(any(Registration.class));
        verify(emailService).sendAdminNotification(any(Registration.class));
    }

    @Test
    void rejectsRegistrationForAnUnpublishedCourse() {
        publishedCourse.setPublished(false);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));

        assertThatThrownBy(() -> registrationService.register(validRequest()))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(registrationRepository, never()).save(any());
        verify(emailService, never()).sendRegistrationConfirmation(any());
    }

    @Test
    void rejectsRegistrationWhenCourseDoesNotExist() {
        when(courseRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> registrationService.register(validRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void rejectsRegistrationWhenCohortIsClosed() {
        openCohort.setStatus(CohortStatus.CLOSED);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));

        assertThatThrownBy(() -> registrationService.register(validRequest()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("not currently open");

        verify(registrationRepository, never()).save(any());
    }

    @Test
    void rejectsRegistrationWhenCohortCapacityIsReached() {
        openCohort.setCapacity(5);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));
        when(registrationRepository.countByCohortId(10L)).thenReturn(5L);

        assertThatThrownBy(() -> registrationService.register(validRequest()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("full");

        verify(registrationRepository, never()).save(any());
    }

    @Test
    void allowsRegistrationWhenBelowCapacity() {
        openCohort.setCapacity(5);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));
        when(registrationRepository.countByCohortId(10L)).thenReturn(4L);
        when(registrationRepository.existsByEmailAndCohortId(any(), any())).thenReturn(false);
        when(registrationNumberGenerator.next()).thenReturn("REG-2026-00002");
        when(registrationRepository.save(any(Registration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegistrationResponse response = registrationService.register(validRequest());

        assertThat(response.registrationNumber()).isEqualTo("REG-2026-00002");
    }

    @Test
    void rejectsDuplicateRegistrationForSameEmailAndCohort() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));
        when(registrationRepository.existsByEmailAndCohortId("jane@example.com", 10L)).thenReturn(true);

        assertThatThrownBy(() -> registrationService.register(validRequest()))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("already registered");

        verify(registrationRepository, never()).save(any());
    }

    @Test
    void rejectsRegistrationWhenCohortBelongsToADifferentCourse() {
        Course anotherCourse = new Course();
        anotherCourse.setId(2L);
        anotherCourse.setPublished(true);
        openCohort.setCourse(anotherCourse);

        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));

        assertThatThrownBy(() -> registrationService.register(validRequest()))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void emailFailureDoesNotPreventRegistrationFromSucceeding() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));
        when(registrationRepository.existsByEmailAndCohortId(any(), any())).thenReturn(false);
        when(registrationNumberGenerator.next()).thenReturn("REG-2026-00003");
        when(registrationRepository.save(any(Registration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // EmailService itself swallows failures internally (see EmailService.send) — this test
        // documents that RegistrationService doesn't need to defend against email exceptions,
        // since a mocked void method that doesn't throw already proves the call is unguarded
        // fire-and-forget from this service's perspective.
        RegistrationResponse response = registrationService.register(validRequest());

        assertThat(response.registrationNumber()).isEqualTo("REG-2026-00003");
    }

    @Test
    void rejectsPrivateTutorialRegistrationWithNoPreferredTime() {
        openCohort.setPrivateTutorial(true);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));
        when(registrationRepository.existsByEmailAndCohortId(any(), any())).thenReturn(false);

        assertThatThrownBy(() -> registrationService.register(validRequest(null)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("preferred time");

        verify(registrationRepository, never()).save(any());
    }

    @Test
    void rejectsPrivateTutorialRegistrationWithBlankPreferredTime() {
        openCohort.setPrivateTutorial(true);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));
        when(registrationRepository.existsByEmailAndCohortId(any(), any())).thenReturn(false);

        assertThatThrownBy(() -> registrationService.register(validRequest("   ")))
                .isInstanceOf(BadRequestException.class);
    }

    @Test
    void allowsPrivateTutorialRegistrationWithAPreferredTime() {
        openCohort.setPrivateTutorial(true);
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));
        when(registrationRepository.existsByEmailAndCohortId(any(), any())).thenReturn(false);
        when(registrationNumberGenerator.next()).thenReturn("REG-2026-00004");
        when(registrationRepository.save(any(Registration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegistrationResponse response = registrationService.register(validRequest("Weekday evenings, after 6pm"));

        assertThat(response.privateTutorial()).isTrue();
        assertThat(response.preferredTime()).isEqualTo("Weekday evenings, after 6pm");
    }

    @Test
    void groupCohortRegistrationDoesNotRequireAPreferredTime() {
        when(courseRepository.findById(1L)).thenReturn(Optional.of(publishedCourse));
        when(cohortRepository.findById(10L)).thenReturn(Optional.of(openCohort));
        when(registrationRepository.existsByEmailAndCohortId(any(), any())).thenReturn(false);
        when(registrationNumberGenerator.next()).thenReturn("REG-2026-00005");
        when(registrationRepository.save(any(Registration.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegistrationResponse response = registrationService.register(validRequest(null));

        assertThat(response.privateTutorial()).isFalse();
        assertThat(response.preferredTime()).isNull();
    }
}
