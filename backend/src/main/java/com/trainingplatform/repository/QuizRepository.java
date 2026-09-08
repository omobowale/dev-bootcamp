package com.trainingplatform.repository;

import com.trainingplatform.entity.Quiz;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    Optional<Quiz> findByClassSessionId(Long classSessionId);
}
