package com.trainingplatform.repository;

import com.trainingplatform.entity.Certificate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificateRepository extends JpaRepository<Certificate, Long> {
    Optional<Certificate> findByStudentIdAndCourseId(Long studentId, Long courseId);

    Optional<Certificate> findByVerificationId(String verificationId);

    List<Certificate> findByCourseIdOrderByCreatedAtDesc(Long courseId);
}
