package com.trainingplatform.repository;

import com.trainingplatform.entity.ClassCompletion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassCompletionRepository extends JpaRepository<ClassCompletion, Long> {
    boolean existsByClassSessionIdAndStudentId(Long classSessionId, Long studentId);

    List<ClassCompletion> findByStudentIdAndClassSession_Module_Course_Id(Long studentId, Long courseId);
}
