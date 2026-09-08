package com.trainingplatform.repository;

import com.trainingplatform.entity.CourseEnrollment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    boolean existsByRegistrationId(Long registrationId);

    Optional<CourseEnrollment> findByRegistrationId(Long registrationId);

    boolean existsByStudentIdAndCourseId(Long studentId, Long courseId);

    List<CourseEnrollment> findByCourseId(Long courseId);
}
