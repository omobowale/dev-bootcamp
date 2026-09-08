package com.trainingplatform.service;

import com.trainingplatform.entity.CourseEnrollment;
import com.trainingplatform.entity.Registration;
import com.trainingplatform.entity.Student;
import com.trainingplatform.entity.StudentStatus;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.repository.StudentRepository;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Turns a CONFIRMED Registration into real course access: a Student account (created the first
 * time this email is seen — a later registration from the same email just adds another
 * enrollment to the existing account, never a second account) plus a CourseEnrollment, and an
 * emailed invite link to set a password. See 09_LMS_Implementation_Plan.md — this is the exact
 * trigger point that plan calls for, deliberately reusing the existing "mark CONFIRMED" admin
 * action rather than adding a separate enroll step.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudentEnrollmentService {

    private static final int INVITE_TOKEN_BYTES = 32;
    private static final int INVITE_TOKEN_VALID_DAYS = 7;

    private final StudentRepository studentRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final StudentIdGenerator studentIdGenerator;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.frontend-base-url}")
    private String frontendBaseUrl;

    @Transactional
    public void enroll(Registration registration) {
        // Idempotency: re-confirming (or a status bouncing CONFIRMED -> something -> CONFIRMED
        // again) must not try to create a second enrollment for the same registration.
        if (courseEnrollmentRepository.existsByRegistrationId(registration.getId())) {
            return;
        }

        Student student = studentRepository.findByEmail(registration.getEmail()).orElseGet(() -> createStudent(registration));

        CourseEnrollment enrollment = new CourseEnrollment();
        enrollment.setStudent(student);
        enrollment.setCourse(registration.getCourse());
        enrollment.setCohort(registration.getCohort());
        enrollment.setRegistration(registration);
        courseEnrollmentRepository.save(enrollment);

        if (student.getStatus() == StudentStatus.INVITED) {
            String inviteUrl = frontendBaseUrl + "/student/invite/" + student.getInviteToken();
            emailService.sendStudentInvite(student, inviteUrl, registration.getCourse().getTitle());
        }
    }

    private Student createStudent(Registration registration) {
        Student student = new Student();
        student.setStudentId(studentIdGenerator.next());
        student.setFullName(registration.getFullName());
        student.setEmail(registration.getEmail());
        student.setStatus(StudentStatus.INVITED);
        student.setInviteToken(generateInviteToken());
        student.setInviteTokenExpiresAt(Instant.now().plus(INVITE_TOKEN_VALID_DAYS, ChronoUnit.DAYS));
        return studentRepository.save(student);
    }

    private String generateInviteToken() {
        byte[] bytes = new byte[INVITE_TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
