package com.trainingplatform.repository;

import com.trainingplatform.entity.Faq;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FaqRepository extends JpaRepository<Faq, Long> {
    List<Faq> findByCourseIdOrderByPositionAsc(Long courseId);

    List<Faq> findByCourseIsNullOrderByPositionAsc();
}
