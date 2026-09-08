package com.trainingplatform.service;

import com.trainingplatform.dto.AdminActionLogResponse;
import com.trainingplatform.dto.AdminRegistrationDetailResponse;
import com.trainingplatform.dto.AdminRegistrationListItemResponse;
import com.trainingplatform.dto.ManualEnrollmentRequest;
import com.trainingplatform.dto.PagedResponse;
import com.trainingplatform.entity.Cohort;
import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.Registration;
import com.trainingplatform.entity.RegistrationStatus;
import com.trainingplatform.exception.ConflictException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CohortRepository;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.repository.RegistrationRepository;
import com.trainingplatform.repository.RegistrationSpecifications;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminRegistrationService {

    private final RegistrationRepository registrationRepository;
    private final CourseRepository courseRepository;
    private final CohortRepository cohortRepository;
    private final RegistrationNumberGenerator registrationNumberGenerator;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;
    private final StudentEnrollmentService studentEnrollmentService;
    private final CourseEnrollmentRepository courseEnrollmentRepository;

    @Transactional(readOnly = true)
    public PagedResponse<AdminRegistrationListItemResponse> list(
            RegistrationStatus status, Long courseId, Long cohortId, String search, int page, int size) {
        var spec = RegistrationSpecifications.filter(status, courseId, cohortId, search);
        var pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        var result = registrationRepository.findAll(spec, pageable).map(AdminRegistrationListItemResponse::from);
        return PagedResponse.from(result);
    }

    @Transactional(readOnly = true)
    public AdminRegistrationDetailResponse getById(Long id) {
        return toDetailResponse(getOrThrow(id));
    }

    @Transactional(readOnly = true)
    public List<AdminActionLogResponse> getActivity(Long id) {
        getOrThrow(id);
        return adminActionLogService.findFor("Registration", id);
    }

    @Transactional
    public AdminRegistrationDetailResponse updateStatus(Long id, RegistrationStatus newStatus) {
        Registration registration = getOrThrow(id);
        registration.setStatus(newStatus);
        registration = registrationRepository.save(registration);

        adminActionLogService.log(
                currentAdminProvider.getCurrentAdmin(),
                "UPDATE_STATUS",
                "Registration",
                registration.getId(),
                "New status: " + newStatus);

        // Confirming a registration is the moment it becomes real course access — see
        // StudentEnrollmentService and 09_LMS_Implementation_Plan.md. Idempotent, so this is
        // safe to call even if the status bounces through CONFIRMED more than once.
        if (newStatus == RegistrationStatus.CONFIRMED) {
            studentEnrollmentService.enroll(registration);
        }

        return toDetailResponse(registration);
    }

    @Transactional
    public AdminRegistrationDetailResponse createManual(ManualEnrollmentRequest request) {
        Course course = courseRepository
                .findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + request.courseId()));
        Cohort cohort = cohortRepository
                .findById(request.cohortId())
                .filter(c -> c.getCourse().getId().equals(course.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found: " + request.cohortId()));

        if (registrationRepository.existsByEmailAndCohortId(request.email(), cohort.getId())) {
            throw new ConflictException("This email is already registered for this cohort.");
        }

        Registration registration = new Registration();
        registration.setRegistrationNumber(registrationNumberGenerator.next());
        registration.setFullName(request.fullName());
        registration.setEmail(request.email());
        registration.setWhatsappNumber(request.whatsappNumber());
        registration.setCourse(course);
        registration.setCohort(cohort);
        registration.setExperienceLevel(request.experienceLevel());
        registration.setReferralSource("Manual (admin-entered)");
        registration.setConsentGiven(true);
        registration.setPreferredTime(request.preferredTime());
        registration.setStatus(RegistrationStatus.CONFIRMED);
        registration = registrationRepository.save(registration);

        adminActionLogService.log(
                currentAdminProvider.getCurrentAdmin(),
                "CREATE_MANUAL",
                "Registration",
                registration.getId(),
                "Manually enrolled " + registration.getFullName());

        // Same trigger point a public registration hits once confirmed — creates the student
        // account (or reuses an existing one by email) and sends the invite email.
        studentEnrollmentService.enroll(registration);

        return toDetailResponse(registration);
    }

    private AdminRegistrationDetailResponse toDetailResponse(Registration registration) {
        String studentId = courseEnrollmentRepository
                .findByRegistrationId(registration.getId())
                .map(enrollment -> enrollment.getStudent().getStudentId())
                .orElse(null);
        return AdminRegistrationDetailResponse.from(registration, studentId);
    }

    private Registration getOrThrow(Long id) {
        return registrationRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found: " + id));
    }
}
