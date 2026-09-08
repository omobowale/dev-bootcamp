package com.trainingplatform.repository;

import com.trainingplatform.entity.CourseCompletionCriteria;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseCompletionCriteriaRepository extends JpaRepository<CourseCompletionCriteria, Long> {
    Optional<CourseCompletionCriteria> findByCourseId(Long courseId);
}
