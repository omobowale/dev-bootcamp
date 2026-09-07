package com.trainingplatform.repository;

import com.trainingplatform.entity.CourseTopic;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseTopicRepository extends JpaRepository<CourseTopic, Long> {
    List<CourseTopic> findByModuleIdOrderByPositionAsc(Long moduleId);

    int countByModuleId(Long moduleId);
}
