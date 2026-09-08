package com.trainingplatform.repository;

import com.trainingplatform.entity.Quiz;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByClassSessionId(Long classSessionId);

    List<Quiz> findByClassSession_Module_Course_Id(Long courseId);
}
