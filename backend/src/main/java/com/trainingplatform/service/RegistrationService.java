package com.trainingplatform.service;

import com.trainingplatform.dto.RegistrationRequest;
import com.trainingplatform.dto.RegistrationResponse;
import com.trainingplatform.entity.Cohort;
import com.trainingplatform.entity.CohortStatus;
import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.Registration;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ConflictException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CohortRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.repository.RegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final RegistrationRepository registrationRepository;
    private final CourseRepository courseRepository;
    private final CohortRepository cohortRepository;
    private final RegistrationNumberGenerator registrationNumberGenerator;
    private final EmailService emailService;

    @Transactional
    public RegistrationResponse register(RegistrationRequest request) {
        Course course = courseRepository
                .findById(request.courseId())
                .filter(Course::isPublished)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + request.courseId()));

        Cohort cohort = cohortRepository
                .findById(request.cohortId())
                .filter(c -> c.getCourse().getId().equals(course.getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Cohort not found: " + request.cohortId()));

        if (cohort.getStatus() != CohortStatus.OPEN) {
            throw new ConflictException("This cohort is not currently open for registration.");
        }

        if (cohort.getCapacity() != null) {
            long currentCount = registrationRepository.countByCohortId(cohort.getId());
            if (currentCount >= cohort.getCapacity()) {
                throw new ConflictException("This cohort is full. Please check other available cohorts.");
            }
        }

        if (registrationRepository.existsByEmailAndCohortId(request.email(), cohort.getId())) {
            throw new ConflictException("You've already registered for this cohort with this email address.");
        }

        if (cohort.isPrivateTutorial() && (request.preferredTime() == null || request.preferredTime().isBlank())) {
            throw new BadRequestException("Please let us know your preferred time for this private tutorial.");
        }

        Registration registration = new Registration();
        registration.setRegistrationNumber(registrationNumberGenerator.next());
        registration.setFullName(request.fullName());
        registration.setEmail(request.email());
        registration.setWhatsappNumber(request.whatsappNumber());
        registration.setCourse(course);
        registration.setCohort(cohort);
        registration.setExperienceLevel(request.experienceLevel());
        registration.setReferralSource(request.referralSource());
        registration.setConsentGiven(request.consentGiven());
        registration.setPreferredTime(request.preferredTime());

        registration = registrationRepository.save(registration);

        emailService.sendRegistrationConfirmation(registration);
        emailService.sendAdminNotification(registration);

        return RegistrationResponse.from(registration);
    }
}
