package com.trainingplatform.service;

import com.trainingplatform.dto.CertificateResponse;
import com.trainingplatform.entity.Certificate;
import com.trainingplatform.entity.Course;
import com.trainingplatform.entity.Student;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ForbiddenException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CertificateRepository;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.repository.CourseRepository;
import com.trainingplatform.security.CurrentStudentProvider;
import java.time.LocalDate;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentCertificateService {

    private final CertificateRepository certificateRepository;
    private final com.trainingplatform.repository.StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final StudentProgressService studentProgressService;
    private final CertificateIdGenerator certificateIdGenerator;
    private final CurrentStudentProvider currentStudentProvider;

    @Transactional(readOnly = true)
    public Optional<CertificateResponse> getMine(Long courseId) {
        Student student = currentStudentProvider.getCurrentStudent();
        requireEnrolled(student, courseId);
        return certificateRepository.findByStudentIdAndCourseId(student.getId(), courseId).map(CertificateResponse::from);
    }

    @Transactional
    public CertificateResponse issue(Long courseId) {
        // Serialize certificate issuance for this learner; concurrent clicks return the same record.
        Student student = studentRepository.findForUpdate(currentStudentProvider.getCurrentStudent().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found."));
        requireEnrolled(student, courseId);

        Optional<Certificate> existing = certificateRepository.findByStudentIdAndCourseId(student.getId(), courseId);
        if (existing.isPresent()) {
            return CertificateResponse.from(existing.get());
        }

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found: " + courseId));
        if (!course.isCertificateAvailable()) throw new BadRequestException("Certificates are not enabled for this course.");
        boolean eligible = courseEnrollmentRepository.findByStudentIdOrderByCreatedAtDesc(student.getId()).stream()
                .filter(e -> e.isActive() && e.getRegistration().getStatus()!=com.trainingplatform.entity.RegistrationStatus.CANCELLED && e.getCourse().getId().equals(courseId))
                .anyMatch(e -> studentProgressService.getProgressForStudent(student,courseId,e.getCohort().getId()).courseComplete());
        if (!eligible) throw new BadRequestException("You haven't met this course's completion criteria yet.");

        Certificate certificate = new Certificate();
        certificate.setStudent(student);
        certificate.setCourse(course);
        certificate.setVerificationId(certificateIdGenerator.next());
        certificate.setCompletionDate(LocalDate.now());
        certificate = certificateRepository.save(certificate);

        return CertificateResponse.from(certificate);
    }

    private void requireEnrolled(Student student, Long courseId) {
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ForbiddenException("You are not enrolled in this course.");
        }
    }
}
