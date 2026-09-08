import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { useStudentClass, useStudentMe } from "../../hooks/student/useStudentPortal";
import { useSubmitAssignment } from "../../hooks/student/useStudentAssignment";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Icon } from "../../components/Icon";
import { sanitizeRichText } from "../../utils/richText";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import { studentQuizAttemptPath } from "../../constants/routes";
import type { StudentAssignment } from "../../types/student";
import "./StudentDashboardPage.css";

const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: "Submitted — awaiting review",
  UNDER_REVIEW: "Under review",
  REVIEWED: "Reviewed",
  NEEDS_RESUBMISSION: "Needs resubmission",
};

function AssignmentSection({ assignment }: { assignment: StudentAssignment }) {
  const [responseText, setResponseText] = useState(assignment.mySubmission?.responseText ?? "");
  const [attachment, setAttachment] = useState<File | null>(null);
  const submit = useSubmitAssignment();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit.mutate({ assignmentId: assignment.id, responseText, attachment });
  };

  return (
    <div className="card student-class-card">
      <h3>{assignment.title}</h3>
      {assignment.dueAt && <p className="text-muted">Due {formatDate(assignment.dueAt)}</p>}

      {assignment.learningObjective && <p>{assignment.learningObjective}</p>}
      {assignment.instructions && (
        <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(assignment.instructions) }} />
      )}
      {assignment.tasks && (
        <>
          <h4>Tasks</h4>
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(assignment.tasks) }} />
        </>
      )}
      {assignment.submissionRequirements && (
        <p className="text-muted">
          <strong>Submission requirements:</strong> {assignment.submissionRequirements}
        </p>
      )}

      {assignment.mySubmission && (
        <div className="notice-panel" style={{ margin: "16px 0" }}>
          <p>
            <strong>{SUBMISSION_STATUS_LABELS[assignment.mySubmission.status]}</strong> ·{" "}
            {formatDateTime(assignment.mySubmission.submittedAt)}
          </p>
          {assignment.mySubmission.score !== null && (
            <p>
              Score: {assignment.mySubmission.score}/{assignment.maxScore}
            </p>
          )}
          {assignment.mySubmission.feedback && <p>Feedback: {assignment.mySubmission.feedback}</p>}
          {assignment.mySubmission.attachmentUrl && (
            <a href={assignment.mySubmission.attachmentUrl} target="_blank" rel="noreferrer" className="text-link">
              {assignment.mySubmission.attachmentFilename ?? "View submitted attachment"}
            </a>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <label className="form-field form-field--full">
          {assignment.mySubmission ? "Resubmit your response" : "Your response"}
          <textarea rows={5} value={responseText} onChange={(e) => setResponseText(e.target.value)} />
        </label>
        <label className="form-field form-field--full">
          Attachment (optional){assignment.allowedAttachmentTypes && ` — ${assignment.allowedAttachmentTypes}`}
          <input type="file" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={submit.isPending}>
          {submit.isPending ? "Submitting…" : assignment.mySubmission ? "Resubmit" : "Submit assignment"}
        </button>
        {submit.isSuccess && <p className="quiz-result-correct" style={{ marginTop: 8 }}>Submitted!</p>}
      </form>
    </div>
  );
}

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

            {session.assignment && <AssignmentSection assignment={session.assignment} />}
          </>
        )}
      </div>
    </div>
  );
}
