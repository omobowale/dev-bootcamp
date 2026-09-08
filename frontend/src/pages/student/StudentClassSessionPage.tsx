import { Link, useNavigate, useParams } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { useStudentClass, useStudentMe } from "../../hooks/student/useStudentPortal";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Icon } from "../../components/Icon";
import { sanitizeRichText } from "../../utils/richText";
import { formatDateTime } from "../../utils/formatDate";
import { studentQuizAttemptPath } from "../../constants/routes";
import "./StudentDashboardPage.css";

export function StudentClassSessionPage() {
  const { classSessionId } = useParams<{ classSessionId: string }>();
  const navigate = useNavigate();
  const { student, logout } = useStudentAuth();
  const { data: me } = useStudentMe();
  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = useStudentClass(Number(classSessionId));

  return (
    <div className="student-shell">
      <header className="student-topbar">
        <div className="container student-topbar__inner">
          <span className="student-topbar__brand">DevTraining.</span>
          <div className="student-topbar__profile">
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
        {isLoading && <LoadingState label="Loading class…" />}
        {isError && <ErrorState message="Couldn't load this class. You may not be enrolled in it." onRetry={() => refetch()} />}

        {session && (
          <>
            <div className="student-page__header">
              <button type="button" className="text-link student-back-link" onClick={() => navigate(-1)}>
                <Icon name="arrow" size={13} style={{ transform: "rotate(180deg)" }} /> Back to classes
              </button>
              <span className="eyebrow">CLASS</span>
              <h1>{session.title}</h1>
              {session.scheduledAt && <p className="text-muted">{formatDateTime(session.scheduledAt)}</p>}
            </div>

            {session.objectives && (
              <div className="card student-class-card">
                <h3>Objectives</h3>
                <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(session.objectives) }} />
              </div>
            )}

            {(session.meetingLink || session.recordingUrl) && (
              <div className="student-class-card__links">
                {session.meetingLink && (
                  <a href={session.meetingLink} target="_blank" rel="noreferrer" className="btn btn-primary">
                    <Icon name="diagonal" size={15} /> Join live class
                  </a>
                )}
                {session.recordingUrl && (
                  <a href={session.recordingUrl} target="_blank" rel="noreferrer" className="btn btn-secondary">
                    <Icon name="eye" size={15} /> Watch recording
                  </a>
                )}
              </div>
            )}

            {session.sections.length === 0 && (
              <div className="notice-panel">
                <Icon name="book" size={24} />
                <h3>Content is on its way.</h3>
                <p>Your instructor hasn't added lesson content for this class yet.</p>
              </div>
            )}

            {session.sections.map((section, index) => (
              <div className="card student-class-card" key={index}>
                <h3>{section.title}</h3>
                {section.body && (
                  <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(section.body) }} />
                )}
              </div>
            ))}

            {session.quiz && (
              <div className="card student-class-card quiz-summary-card">
                <div>
                  <h3 style={{ margin: "0 0 6px" }}>Quiz</h3>
                  <p className="text-muted" style={{ margin: 0 }}>
                    {session.quiz.questionCount} question{session.quiz.questionCount === 1 ? "" : "s"} · Pass at{" "}
                    {session.quiz.passingPercentage}%
                    {session.quiz.maxAttempts !== null && ` · ${session.quiz.maxAttempts} attempt${session.quiz.maxAttempts === 1 ? "" : "s"} allowed`}
                  </p>
                  {session.quiz.attemptsUsed > 0 && (
                    <p className="text-muted" style={{ margin: "4px 0 0" }}>
                      Best score: {session.quiz.bestPercentage?.toFixed(0)}%{" "}
                      {session.quiz.bestPassed ? (
                        <span className="quiz-result-correct">Passed</span>
                      ) : (
                        <span className="quiz-result-incorrect">Not passed yet</span>
                      )}
                    </p>
                  )}
                </div>
                {session.quiz.canAttempt ? (
                  <Link to={studentQuizAttemptPath(session.quiz.quizId)} className="btn btn-primary">
                    {session.quiz.attemptsUsed > 0 ? "Retake quiz" : "Start quiz"}
                  </Link>
                ) : (
                  <span className="text-muted">
                    {session.quiz.questionCount === 0 ? "Not ready yet" : "No attempts remaining"}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
