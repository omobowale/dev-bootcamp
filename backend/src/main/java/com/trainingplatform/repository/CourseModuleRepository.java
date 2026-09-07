package com.trainingplatform.repository;

import com.trainingplatform.entity.CourseModule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseIdOrderByPositionAsc(Long courseId);

    int countByCourseId(Long courseId);
}
