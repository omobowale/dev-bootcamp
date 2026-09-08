package com.trainingplatform.repository;

import com.trainingplatform.entity.ClassSession;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ClassSessionRepository extends JpaRepository<ClassSession, Long> {
    List<ClassSession> findByModuleIdOrderByPositionAsc(Long moduleId);

    int countByModuleId(Long moduleId);

    @Query(
            "SELECT cs FROM ClassSession cs WHERE cs.module.course.id = :courseId "
                    + "ORDER BY cs.module.position ASC, cs.position ASC")
    List<ClassSession> findByCourseIdOrderByModulePositionAscPositionAsc(@Param("courseId") Long courseId);
}
