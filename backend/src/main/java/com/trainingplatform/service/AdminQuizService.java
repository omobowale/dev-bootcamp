package com.trainingplatform.service;

import com.trainingplatform.dto.AdminQuizAttemptResponse;
import com.trainingplatform.dto.QuizQuestionRequest;
import com.trainingplatform.dto.QuizQuestionResponse;
import com.trainingplatform.dto.QuizResponse;
import com.trainingplatform.dto.QuizSettingsRequest;
import com.trainingplatform.entity.ClassSession;
import com.trainingplatform.entity.Quiz;
import com.trainingplatform.entity.QuizQuestion;
import com.trainingplatform.exception.ConflictException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.ClassSessionRepository;
import com.trainingplatform.repository.QuizAttemptRepository;
import com.trainingplatform.repository.QuizQuestionRepository;
import com.trainingplatform.repository.QuizRepository;
import com.trainingplatform.security.CurrentAdminProvider;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminQuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ClassSessionRepository classSessionRepository;
    private final CurrentAdminProvider currentAdminProvider;
    private final AdminActionLogService adminActionLogService;

    @Transactional(readOnly = true)
    public Optional<QuizResponse> findForClassSession(Long classSessionId) {
        return quizRepository.findByClassSessionId(classSessionId).map(this::toResponse);
    }

    @Transactional
    public QuizResponse create(Long classSessionId) {
        if (quizRepository.findByClassSessionId(classSessionId).isPresent()) {
            throw new ConflictException("This class already has a quiz.");
        }
        ClassSession session = classSessionRepository
                .findById(classSessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found: " + classSessionId));

        Quiz quiz = new Quiz();
        quiz.setClassSession(session);
        quiz.setPassingPercentage(70);
        quiz = quizRepository.save(quiz);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "CREATE", "Quiz", quiz.getId());
        return toResponse(quiz);
    }

    @Transactional
    public QuizResponse updateSettings(Long quizId, QuizSettingsRequest request) {
        Quiz quiz = getQuizOrThrow(quizId);
        quiz.setPassingPercentage(request.passingPercentage());
        quiz.setMaxAttempts(request.maxAttempts());
        quiz = quizRepository.save(quiz);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "UPDATE", "Quiz", quiz.getId());
        return toResponse(quiz);
    }

    @Transactional
    public QuizQuestionResponse createQuestion(Long quizId, QuizQuestionRequest request) {
        Quiz quiz = getQuizOrThrow(quizId);

        QuizQuestion question = new QuizQuestion();
        question.setQuiz(quiz);
        applyRequest(question, request);
        question = quizQuestionRepository.save(question);

        adminActionLogService.log(
                currentAdminProvider.getCurrentAdmin(), "CREATE", "QuizQuestion", question.getId());
        return QuizQuestionResponse.from(question);
    }

    @Transactional
    public QuizQuestionResponse updateQuestion(Long questionId, QuizQuestionRequest request) {
        QuizQuestion question = getQuestionOrThrow(questionId);
        applyRequest(question, request);
        question = quizQuestionRepository.save(question);

        adminActionLogService.log(
                currentAdminProvider.getCurrentAdmin(), "UPDATE", "QuizQuestion", question.getId());
        return QuizQuestionResponse.from(question);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        QuizQuestion question = getQuestionOrThrow(questionId);
        quizQuestionRepository.delete(question);

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "DELETE", "QuizQuestion", questionId);
    }

    @Transactional
    public List<QuizQuestionResponse> reorderQuestions(Long quizId, List<Long> orderedQuestionIds) {
        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByPositionAsc(quizId);

        ReorderValidation.requireCompleteOrder(questions.stream().map(QuizQuestion::getId).toList(), orderedQuestionIds);

        for (int i = 0; i < questions.size(); i++) {
            questions.get(i).setPosition(-(i + 1));
        }
        quizQuestionRepository.saveAll(questions);
        quizQuestionRepository.flush();

        for (QuizQuestion question : questions) {
            question.setPosition(orderedQuestionIds.indexOf(question.getId()) + 1);
        }
        quizQuestionRepository.saveAll(questions);
        quizQuestionRepository.flush();

        adminActionLogService.log(currentAdminProvider.getCurrentAdmin(), "REORDER", "QuizQuestion", quizId);
        return questions.stream()
                .sorted((a, b) -> Integer.compare(a.getPosition(), b.getPosition()))
                .map(QuizQuestionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AdminQuizAttemptResponse> listAttempts(Long quizId) {
        getQuizOrThrow(quizId);
        return quizAttemptRepository.findByQuizIdOrderByCreatedAtDesc(quizId).stream()
                .map(AdminQuizAttemptResponse::from)
                .toList();
    }

    private void applyRequest(QuizQuestion question, QuizQuestionRequest request) {
        question.setText(request.text());
        question.setPoints(request.points());
        question.setExplanation(request.explanation());
        question.setPosition(request.position());

        question.getOptions().clear();
        for (int i = 0; i < request.options().size(); i++) {
            question.getOptions().add(request.options().get(i).toEntity(i));
        }
    }

    private QuizResponse toResponse(Quiz quiz) {
        List<QuizQuestionResponse> questions = quizQuestionRepository
                .findByQuizIdOrderByPositionAsc(quiz.getId())
                .stream()
                .map(QuizQuestionResponse::from)
                .toList();
        return QuizResponse.from(quiz, questions);
    }

    private Quiz getQuizOrThrow(Long quizId) {
        return quizRepository.findById(quizId).orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));
    }

    private QuizQuestion getQuestionOrThrow(Long questionId) {
        return quizQuestionRepository
                .findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Quiz question not found: " + questionId));
    }
}
