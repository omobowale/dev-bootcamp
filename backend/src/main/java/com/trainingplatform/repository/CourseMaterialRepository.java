package com.trainingplatform.repository;

import com.trainingplatform.entity.CourseMaterial;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {

    List<CourseMaterial> findByClassSessionIdOrderByPositionAsc(Long classSessionId);
}
