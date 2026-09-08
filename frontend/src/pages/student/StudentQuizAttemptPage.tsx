import { ThemeToggle } from "../../components/ThemeToggle";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { useStudentMe } from "../../hooks/student/useStudentPortal";
import { useStartQuizAttempt, useSubmitQuizAttempt } from "../../hooks/student/useStudentQuiz";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Icon } from "../../components/Icon";
import { sanitizeRichText } from "../../utils/richText";
import type { QuizAnswerSubmission } from "../../types/student";
import "./StudentDashboardPage.css";

export function StudentQuizAttemptPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { student, logout } = useStudentAuth();
  const { data: me } = useStudentMe();
  const startAttempt = useStartQuizAttempt();
  const submitAttempt = useSubmitQuizAttempt();
  const started = useRef(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  useEffect(() => {
    if (started.current || !quizId) return;
    started.current = true;
    startAttempt.mutate(Number(quizId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const draftKey = startAttempt.data ? `quiz-draft:${student?.email}:${startAttempt.data.attemptId}` : null;
  useEffect(() => {
    if (!draftKey) return;
    try { setAnswers(JSON.parse(sessionStorage.getItem(draftKey) || "{}")); } catch { setAnswers({}); }
  }, [draftKey]);
  useEffect(() => {
    if (submitAttempt.isSuccess && draftKey) sessionStorage.removeItem(draftKey);
  }, [submitAttempt.isSuccess, draftKey]);
  const chooseAnswer = (questionId: number, position: number) => {
    const next = { ...answers, [questionId]: position };
    setAnswers(next);
    if (draftKey) sessionStorage.setItem(draftKey, JSON.stringify(next));
  };
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!startAttempt.data) return;
    const payload: QuizAnswerSubmission[] = startAttempt.data.questions.map((q) => ({
      questionId: q.id,
      selectedOptionPosition: answers[q.id] ?? null,
    }));
    submitAttempt.mutate({ attemptId: startAttempt.data.attemptId, answers: payload });
  };

  return (
    <div className="student-shell">
      <header className="student-topbar">
        <div className="container student-topbar__inner">
          <a href="/student" className="student-topbar__brand">DevTraining<span>Learning space</span></a>
          <div className="student-topbar__profile"><ThemeToggle />
            <span className="student-avatar">{(me?.fullName ?? student?.name ?? "S").charAt(0).toUpperCase()}</span>
            <div>
              <strong>{me?.fullName ?? student?.name}</strong>
              <small>{me?.studentId ?? "Student"}</small>
            </div>
            <button type="button" className="icon-btn" title="Sign out" aria-label="Sign out" onClick={logout}>
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="container student-page">
        {startAttempt.isPending && <LoadingState label="Starting quiz…" />}
        {startAttempt.isError && (
          <ErrorState message="Couldn't start this quiz. You may have used all your attempts, or it may not be ready yet." />
        )}

        {startAttempt.data && !submitAttempt.data && (
          <>
            <div className="student-page__header">
              <span className="eyebrow">QUIZ</span>
              <h1>Answer every question</h1>
              <p className="text-muted">Passing score: {startAttempt.data.passingPercentage}%</p>
            </div>

            <div className="quiz-answer-progress" role="status"><strong>{Object.keys(answers).length} of {startAttempt.data.questions.length} answered</strong><span>Take your time. Review your choices before submitting.</span></div><form onSubmit={handleSubmit}>
              {startAttempt.data.questions.map((question, index) => (
                <div className="card student-class-card" key={question.id}>
                  <h3>
                    {index + 1}. {question.text}
                  </h3>
                  <div className="quiz-options-editor">
                    {question.options.map((option) => (
                      <label className="quiz-options-editor__row" key={option.position}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={answers[question.id] === option.position}
                          onChange={() => chooseAnswer(question.id, option.position)}
                        />
                        {option.text}
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <button type="submit" className="btn btn-primary" disabled={submitAttempt.isPending}>
                {submitAttempt.isPending ? "Submitting…" : "Submit quiz"}
              </button>
            </form>
          </>
        )}

        {submitAttempt.data && (
          <>
            <div className="student-page__header">
              <span className="eyebrow">RESULT</span>
              <h1>{submitAttempt.data.passed ? "You passed!" : "Not quite there yet"}</h1>
              <p className="text-muted">
                {submitAttempt.data.score}/{submitAttempt.data.totalPossible} points ·{" "}
                {submitAttempt.data.percentage.toFixed(0)}% (needed {submitAttempt.data.passingPercentage}%)
              </p>
            </div>

            {submitAttempt.data.answers.map((answer, index) => (
              <div className="card student-class-card" key={answer.questionId}>
                <h3>
                  {index + 1}. {answer.text}{" "}
                  <span className={answer.correct ? "quiz-result-correct" : "quiz-result-incorrect"}>
                    {answer.correct ? "Correct" : "Incorrect"}
                  </span>
                </h3>
                <ul className="quiz-review-options">
                  {answer.options.map((option, optIndex) => (
                    <li
                      key={optIndex}
                      className={
                        option.correct
                          ? "quiz-review-options__correct"
                          : optIndex === answer.selectedOptionPosition
                            ? "quiz-review-options__wrong-pick"
                            : ""
                      }
                    >
                      {option.text}
                      {option.correct ? " ✓" : optIndex === answer.selectedOptionPosition ? " (your answer)" : ""}
                    </li>
                  ))}
                </ul>
                {answer.explanation && (
                  <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(answer.explanation) }} />
                )}
              </div>
            ))}

            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
              Back to class
            </button>
          </>
        )}
      </div>
    </div>
  );
}
