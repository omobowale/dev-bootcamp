package com.trainingplatform.repository;

import com.trainingplatform.entity.CourseEnrollment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {
    List<CourseEnrollment> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    boolean existsByRegistrationId(Long registrationId);

    Optional<CourseEnrollment> findByRegistrationId(Long registrationId);

    @org.springframework.data.jpa.repository.Query("select (count(e)>0) from CourseEnrollment e where e.student.id=:studentId and e.course.id=:courseId and e.active=true and e.registration.status <> com.trainingplatform.entity.RegistrationStatus.CANCELLED")
    boolean existsByStudentIdAndCourseId(@org.springframework.data.repository.query.Param("studentId") Long studentId, @org.springframework.data.repository.query.Param("courseId") Long courseId);

    List<CourseEnrollment> findByCourseId(Long courseId);
}
