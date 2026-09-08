package com.trainingplatform.service;

import com.trainingplatform.dto.AdminQuizOptionDto;
import com.trainingplatform.dto.QuizAnswerResultResponse;
import com.trainingplatform.dto.QuizAnswerSubmission;
import com.trainingplatform.dto.QuizAttemptResultResponse;
import com.trainingplatform.dto.StartQuizAttemptResponse;
import com.trainingplatform.dto.StudentQuizQuestionResponse;
import com.trainingplatform.dto.StudentQuizSummaryResponse;
import com.trainingplatform.dto.SubmitQuizAttemptRequest;
import com.trainingplatform.entity.Quiz;
import com.trainingplatform.entity.QuizAnswer;
import com.trainingplatform.entity.QuizAttempt;
import com.trainingplatform.entity.QuizQuestion;
import com.trainingplatform.entity.Student;
import com.trainingplatform.exception.BadRequestException;
import com.trainingplatform.exception.ForbiddenException;
import com.trainingplatform.exception.ResourceNotFoundException;
import com.trainingplatform.repository.CourseEnrollmentRepository;
import com.trainingplatform.repository.QuizAnswerRepository;
import com.trainingplatform.repository.QuizAttemptRepository;
import com.trainingplatform.repository.QuizQuestionRepository;
import com.trainingplatform.repository.QuizRepository;
import com.trainingplatform.security.CurrentStudentProvider;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentQuizService {

    private final QuizRepository quizRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizAnswerRepository quizAnswerRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final CurrentStudentProvider currentStudentProvider;

    @Transactional(readOnly = true)
    public Optional<StudentQuizSummaryResponse> summaryFor(Long classSessionId, Student student) {
        return quizRepository.findByClassSessionId(classSessionId).map(quiz -> buildSummary(quiz, student));
    }

    @Transactional
    public StartQuizAttemptResponse startAttempt(Long quizId) {
        Student student = currentStudentProvider.getCurrentStudent();
        Quiz quiz = getQuizOrThrow(quizId);
        requireEnrolled(student, quiz);

        int attemptsUsed = quizAttemptRepository.countByQuizIdAndStudentId(quizId, student.getId());
        if (quiz.getMaxAttempts() != null && attemptsUsed >= quiz.getMaxAttempts()) {
            throw new BadRequestException("You've used all your attempts for this quiz.");
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByPositionAsc(quizId);
        if (questions.isEmpty()) {
            throw new BadRequestException("This quiz has no questions yet.");
        }

        QuizAttempt attempt = new QuizAttempt();
        attempt.setQuiz(quiz);
        attempt.setStudent(student);
        attempt = quizAttemptRepository.save(attempt);

        return new StartQuizAttemptResponse(
                attempt.getId(),
                quiz.getId(),
                quiz.getPassingPercentage(),
                questions.stream().map(StudentQuizQuestionResponse::from).toList());
    }

    @Transactional
    public QuizAttemptResultResponse submitAttempt(Long attemptId, SubmitQuizAttemptRequest request) {
        Student student = currentStudentProvider.getCurrentStudent();
        QuizAttempt attempt = quizAttemptRepository
                .findByIdAndStudentId(attemptId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

        if (attempt.getSubmittedAt() != null) {
            throw new BadRequestException("This attempt has already been submitted.");
        }

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByPositionAsc(attempt.getQuiz().getId());
        Map<Long, Integer> answersByQuestion = request.answers().stream()
                .collect(Collectors.toMap(
                        QuizAnswerSubmission::questionId, QuizAnswerSubmission::selectedOptionPosition, (a, b) -> b));

        int score = 0;
        int totalPossible = 0;
        List<QuizAnswerResultResponse> results = new ArrayList<>();

        for (QuizQuestion question : questions) {
            totalPossible += question.getPoints();
            Integer selectedPosition = answersByQuestion.get(question.getId());
            boolean correct = selectedPosition != null
                    && question.getOptions().stream()
                            .anyMatch(o -> o.getPosition().equals(selectedPosition) && o.isCorrect());
            if (correct) {
                score += question.getPoints();
            }

            QuizAnswer answer = new QuizAnswer();
            answer.setAttempt(attempt);
            answer.setQuestion(question);
            answer.setSelectedOptionPosition(selectedPosition);
            answer.setCorrect(correct);
            quizAnswerRepository.save(answer);

            results.add(new QuizAnswerResultResponse(
                    question.getId(),
                    question.getText(),
                    question.getPoints(),
                    question.getExplanation(),
                    question.getOptions().stream().map(AdminQuizOptionDto::from).toList(),
                    selectedPosition,
                    correct));
        }

        double percentage = totalPossible == 0 ? 0 : (score * 100.0) / totalPossible;
        boolean passed = percentage >= attempt.getQuiz().getPassingPercentage();

        attempt.setSubmittedAt(Instant.now());
        attempt.setScore(score);
        attempt.setTotalPossible(totalPossible);
        attempt.setPercentage(percentage);
        attempt.setPassed(passed);
        quizAttemptRepository.save(attempt);

        return new QuizAttemptResultResponse(
                attempt.getId(), score, totalPossible, percentage, passed, attempt.getQuiz().getPassingPercentage(), results);
    }

    @Transactional(readOnly = true)
    public QuizAttemptResultResponse getAttemptResult(Long attemptId) {
        Student student = currentStudentProvider.getCurrentStudent();
        QuizAttempt attempt = quizAttemptRepository
                .findByIdAndStudentId(attemptId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

        if (attempt.getSubmittedAt() == null) {
            throw new BadRequestException("This attempt hasn't been submitted yet.");
        }

        Map<Long, QuizAnswer> answersByQuestionId = quizAnswerRepository.findByAttemptId(attemptId).stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        List<QuizQuestion> questions = quizQuestionRepository.findByQuizIdOrderByPositionAsc(attempt.getQuiz().getId());
        List<QuizAnswerResultResponse> results = questions.stream()
                .map(question -> {
                    QuizAnswer answer = answersByQuestionId.get(question.getId());
                    return new QuizAnswerResultResponse(
                            question.getId(),
                            question.getText(),
                            question.getPoints(),
                            question.getExplanation(),
                            question.getOptions().stream().map(AdminQuizOptionDto::from).toList(),
                            answer != null ? answer.getSelectedOptionPosition() : null,
                            answer != null && answer.isCorrect());
                })
                .toList();

        return new QuizAttemptResultResponse(
                attempt.getId(),
                attempt.getScore(),
                attempt.getTotalPossible(),
                attempt.getPercentage(),
                attempt.getPassed(),
                attempt.getQuiz().getPassingPercentage(),
                results);
    }

    private StudentQuizSummaryResponse buildSummary(Quiz quiz, Student student) {
        int questionCount = quizQuestionRepository.findByQuizIdOrderByPositionAsc(quiz.getId()).size();
        List<QuizAttempt> attempts =
                quizAttemptRepository.findByQuizIdAndStudentIdOrderByCreatedAtDesc(quiz.getId(), student.getId());
        int attemptsUsed = attempts.size();
        Double bestPercentage = attempts.stream()
                .map(QuizAttempt::getPercentage)
                .filter(Objects::nonNull)
                .max(Double::compareTo)
                .orElse(null);
        Boolean bestPassed = attempts.stream().anyMatch(a -> Boolean.TRUE.equals(a.getPassed()));
        boolean canAttempt = questionCount > 0 && (quiz.getMaxAttempts() == null || attemptsUsed < quiz.getMaxAttempts());

        return new StudentQuizSummaryResponse(
                quiz.getId(),
                quiz.getPassingPercentage(),
                quiz.getMaxAttempts(),
                questionCount,
                attemptsUsed,
                bestPercentage,
                attemptsUsed == 0 ? null : bestPassed,
                canAttempt);
    }

    private void requireEnrolled(Student student, Quiz quiz) {
        Long courseId = quiz.getClassSession().getModule().getCourse().getId();
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ForbiddenException("You are not enrolled in this course.");
        }
    }

    private Quiz getQuizOrThrow(Long quizId) {
        return quizRepository.findById(quizId).orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));
    }
}
