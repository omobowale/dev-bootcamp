package com.trainingplatform.repository;

import com.trainingplatform.entity.QuizAnswer;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAnswerRepository extends JpaRepository<QuizAnswer, Long> {
    List<QuizAnswer> findByAttemptId(Long attemptId);
}
