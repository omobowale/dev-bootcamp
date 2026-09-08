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

        var openAttempt = quizAttemptRepository.findByQuizIdAndStudentIdOrderByCreatedAtDesc(quizId, student.getId()).stream()
                .filter(a -> a.getSubmittedAt() == null).findFirst();
        if (openAttempt.isPresent()) {
            QuizAttempt resumed = openAttempt.get();
            if (resumed.getQuestionSnapshot() == null) {
                freeze(resumed, quizQuestionRepository.findByQuizIdOrderByPositionAsc(quizId));
                quizAttemptRepository.save(resumed);
            }
            return new StartQuizAttemptResponse(resumed.getId(), quizId, passingPercentage(resumed),
                    questionsFor(resumed).stream().map(StudentQuizQuestionResponse::from).toList());
        }
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
        freeze(attempt, questions);
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
                .findForUpdate(attemptId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

        requireEnrolled(student, attempt.getQuiz());
        if (attempt.getSubmittedAt() != null) {
            throw new BadRequestException("This attempt has already been submitted.");
        }

        List<QuizQuestion> questions = questionsFor(attempt);
        Map<Long, Integer> answersByQuestion = new java.util.HashMap<>();
        for (QuizAnswerSubmission answer : request.answers()) {
            if (answersByQuestion.containsKey(answer.questionId())) {
                throw new BadRequestException("Duplicate question in submission.");
            }
            QuizQuestion question = questions.stream().filter(q -> q.getId().equals(answer.questionId()))
                    .findFirst().orElseThrow(() -> new BadRequestException("Question does not belong to this quiz."));
            if (answer.selectedOptionPosition() != null && question.getOptions().stream()
                    .noneMatch(o -> o.getPosition().equals(answer.selectedOptionPosition()))) {
                throw new BadRequestException("Invalid answer option.");
            }
            answersByQuestion.put(answer.questionId(), answer.selectedOptionPosition());
        }

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

            if (attempt.getQuestionSnapshot() == null) {
            QuizAnswer answer = new QuizAnswer();
            answer.setAttempt(attempt);
            answer.setQuestion(question);
            answer.setSelectedOptionPosition(selectedPosition);
            answer.setCorrect(correct);
            quizAnswerRepository.save(answer);
            }

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
        boolean passed = percentage >= passingPercentage(attempt);

        attempt.setSubmittedAt(Instant.now());
        attempt.setScore(score);
        attempt.setTotalPossible(totalPossible);
        attempt.setPercentage(percentage);
        attempt.setPassed(passed);
        QuizAttemptResultResponse result = new QuizAttemptResultResponse(
                attempt.getId(), score, totalPossible, percentage, passed, passingPercentage(attempt), results);
        attempt.setResultSnapshot(QuizSnapshot.JSON.writeValueAsString(result));
        quizAttemptRepository.save(attempt);
        return result;
    }

    @Transactional(readOnly = true)
    public QuizAttemptResultResponse getAttemptResult(Long attemptId) {
        Student student = currentStudentProvider.getCurrentStudent();
        QuizAttempt attempt = quizAttemptRepository
                .findByIdAndStudentId(attemptId, student.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

        requireEnrolled(student, attempt.getQuiz());
        if (attempt.getSubmittedAt() == null) {
            throw new BadRequestException("This attempt hasn't been submitted yet.");
        }

        if (attempt.getResultSnapshot() != null) {
            return QuizSnapshot.JSON.readValue(attempt.getResultSnapshot(), QuizAttemptResultResponse.class);
        }
        Map<Long, QuizAnswer> answersByQuestionId = quizAnswerRepository.findByAttemptId(attemptId).stream()
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        List<QuizQuestion> questions = questionsFor(attempt);
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
                passingPercentage(attempt),
                results);
    }

    @Transactional(readOnly=true)
    public java.util.Map<String,Integer> getDraft(Long attemptId) {
        Student student=currentStudentProvider.getCurrentStudent();
        QuizAttempt attempt=quizAttemptRepository.findByIdAndStudentId(attemptId,student.getId()).orElseThrow(()->new ResourceNotFoundException("Attempt not found."));
        requireEnrolled(student,attempt.getQuiz());return draft(attempt);
    }
    @SuppressWarnings("unchecked") private java.util.Map<String,Integer> draft(QuizAttempt attempt) {
        return attempt.getDraftAnswers()==null ? new java.util.HashMap<>() : QuizSnapshot.JSON.readValue(attempt.getDraftAnswers(),java.util.HashMap.class);
    }
    @Transactional public void saveDraft(Long attemptId, QuizAnswerSubmission answer) {
        Student student=currentStudentProvider.getCurrentStudent();
        QuizAttempt attempt=quizAttemptRepository.findForUpdate(attemptId,student.getId()).orElseThrow(()->new ResourceNotFoundException("Attempt not found."));
        requireEnrolled(student,attempt.getQuiz());
        if(attempt.getSubmittedAt()!=null) throw new BadRequestException("This attempt is already submitted.");
        QuizQuestion question=questionsFor(attempt).stream().filter(q->q.getId().equals(answer.questionId())).findFirst().orElseThrow(()->new BadRequestException("Unknown question."));
        if(answer.selectedOptionPosition()!=null && question.getOptions().stream().noneMatch(o->o.getPosition().equals(answer.selectedOptionPosition()))) throw new BadRequestException("Invalid option.");
        var values=draft(attempt);values.put(String.valueOf(answer.questionId()),answer.selectedOptionPosition());
        attempt.setDraftAnswers(QuizSnapshot.JSON.writeValueAsString(values));quizAttemptRepository.save(attempt);
    }

    private void freeze(QuizAttempt attempt, List<QuizQuestion> questions) {
        attempt.setQuestionSnapshot(QuizSnapshot.encode(questions));
        attempt.setPassingPercentageSnapshot(attempt.getQuiz().getPassingPercentage());
    }

    private List<QuizQuestion> questionsFor(QuizAttempt attempt) {
        return attempt.getQuestionSnapshot() != null ? QuizSnapshot.decode(attempt.getQuestionSnapshot())
                : quizQuestionRepository.findByQuizIdOrderByPositionAsc(attempt.getQuiz().getId());
    }

    private int passingPercentage(QuizAttempt attempt) {
        return attempt.getPassingPercentageSnapshot() != null ? attempt.getPassingPercentageSnapshot() : attempt.getQuiz().getPassingPercentage();
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
        boolean canAttempt = attempts.stream().anyMatch(a -> a.getSubmittedAt() == null) || (questionCount > 0 && (quiz.getMaxAttempts() == null || attemptsUsed < quiz.getMaxAttempts()));

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
        LearningAccess.require(courseEnrollmentRepository, student.getId(), quiz.getClassSession());
        Long courseId = quiz.getClassSession().getModule().getCourse().getId();
        if (!courseEnrollmentRepository.existsByStudentIdAndCourseId(student.getId(), courseId)) {
            throw new ForbiddenException("You are not enrolled in this course.");
        }
    }

    private Quiz getQuizOrThrow(Long quizId) {
        return quizRepository.findForUpdate(quizId).orElseThrow(() -> new ResourceNotFoundException("Quiz not found: " + quizId));
    }
}
