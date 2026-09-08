package com.trainingplatform.repository;

import com.trainingplatform.entity.QuizQuestion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
    List<QuizQuestion> findByQuizIdOrderByPositionAsc(Long quizId);
}
