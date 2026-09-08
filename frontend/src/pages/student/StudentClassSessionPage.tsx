import { useAssignmentDraft } from "../../hooks/student/useAssignmentDraft";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { RubricBreakdown, StudentRubric } from "../../components/AssignmentRubric";
import { SubmissionHistory } from "../../components/SubmissionHistory";
import { StudentTools } from "../../components/StudentTools";
import { ThemeToggle } from "../../components/ThemeToggle";
import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useStudentAuth } from "../../context/StudentAuthContext";
import { useStudentClass, useStudentMe } from "../../hooks/student/useStudentPortal";
import { useSubmitAssignment } from "../../hooks/student/useStudentAssignment";
import { useMarkClassComplete } from "../../hooks/student/useStudentProgress";
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
  const { student } = useStudentAuth();
  const draftKey = `assignment-draft:${student?.email}:${assignment.id}:${assignment.mySubmission?.version ?? "new"}`;
  const editable=!assignment.mySubmission||assignment.mySubmission.status==="NEEDS_RESUBMISSION";
  const draft=useAssignmentDraft(assignment.id,draftKey,assignment.mySubmission?.responseText??"",editable);
  const responseText=draft.text;
  const [uploadProgress,setUploadProgress]=useState(0);
  const [confirmRevision,setConfirmRevision]=useState(false);
  const [attachment, setAttachment] = useState<File | null>(null);
  const submit = useSubmitAssignment();
  useUnsavedChanges(editable&&!submit.isSuccess&&(draft.dirty||draft.saving||!!attachment));

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (assignment.mySubmission && !confirmRevision) { setConfirmRevision(true); return; }
    submit.mutate({ version: assignment.mySubmission?.version, assignmentId: assignment.id, responseText, attachment, onUploadProgress: setUploadProgress }, {
      onSuccess: () => { draft.submitted(); setAttachment(null); setConfirmRevision(false); },
    });
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

      <StudentRubric assignmentId={assignment.id}/>
      {assignment.mySubmission?.rubricBreakdown&&<RubricBreakdown marks={assignment.mySubmission.rubricBreakdown}/>}
      {assignment.mySubmission && <SubmissionHistory url={`/api/student/assignments/${assignment.id}/history`} />}
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

      {(!assignment.mySubmission || assignment.mySubmission.status === "NEEDS_RESUBMISSION") && <form onSubmit={handleSubmit}>
        <label className="form-field form-field--full">
          {assignment.mySubmission ? "Resubmit your response" : "Your response"}
          <textarea rows={7} maxLength={100000} disabled={!draft.ready||submit.isPending} value={responseText} onChange={(e) => draft.setText(e.target.value)} />
        </label>
        <label className="form-field form-field--full">
          Attachment (optional){assignment.allowedAttachmentTypes && ` — ${assignment.allowedAttachmentTypes}`}
          <input accept={assignment.allowedAttachmentTypes || undefined} type="file" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} />
        </label>
        <p className="text-muted">Your response saves to your account as you write. Attachments stay on this device until submitted. Maximum file size: 10 MB.</p>
        <p className="draft-status" role="status"><Icon name={draft.error?"alertTriangle":draft.saving||draft.dirty?"clock":"check"} size={15}/>{draft.error||(!draft.ready?"Restoring your draft…":draft.saving?"Saving to your account…":draft.dirty?"Changes waiting to save…":"Saved to your account")}</p>
        {draft.error&&!draft.conflict&&<button type="button" className="btn btn-secondary" onClick={draft.retry}>Retry draft sync</button>}
        {draft.conflict&&<div className="draft-conflict" role="alert"><strong>A different version was saved.</strong><p>Choose the text you want to continue with. If the submission changed, refresh to see its new status.</p><details><summary>Read the account draft</summary><p style={{whiteSpace:"pre-wrap"}}>{draft.conflict.responseText||"Empty draft"}</p></details><div><button type="button" className="btn btn-secondary" onClick={()=>draft.resolve(false)}>Use account draft</button><button type="button" className="btn btn-primary" onClick={()=>draft.resolve(true)}>Keep my text</button></div></div>}
        {confirmRevision && <p className="notice-panel" role="status">Your previous submission and feedback will be kept in history. Confirm to send this revision for a fresh review.</p>}
        {submit.isPending && attachment && <label className="form-field">Uploading {uploadProgress}%<progress max={100} value={uploadProgress} /></label>}
        {submit.isError && <p role="alert" className="form-error">Submission failed. Your draft is still here. Check the deadline and file restrictions, then try again.</p>}
        <button type="submit" className="btn btn-primary" disabled={submit.isPending || !draft.ready || draft.saving || draft.dirty || !!draft.conflict || !!draft.error || (!responseText.trim() && !attachment)}>

          {submit.isPending ? "Submitting…" : confirmRevision ? "Confirm resubmission" : assignment.mySubmission ? "Resubmit" : "Submit assignment"}
        </button>
        {submit.isSuccess && <p className="quiz-result-correct" style={{ marginTop: 8 }}>Submitted!</p>}
      </form>}
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
  const markComplete = useMarkClassComplete();

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
      <StudentTools/>

      <div className="container student-page">
        {isLoading && <LoadingState label="Loading class…" />}
        {isError && <ErrorState message="Couldn't load this class. You may not be enrolled in it." onRetry={() => refetch()} />}

        {session && (
          <>
            <div className="student-page__header">
              <button type="button" className="text-link student-back-link" onClick={() => navigate(`/student/courses/${session.courseId}/classes${session.cohortId ? `?cohortId=${session.cohortId}` : ""}`)}>
                <Icon name="arrow" size={13} style={{ transform: "rotate(180deg)" }} /> Back to classes
              </button>
              <span className="eyebrow">CLASS</span>
              <h1>{session.title}</h1>
              {session.scheduledAt && <p className="text-muted">{formatDateTime(session.scheduledAt)}</p>}
            </div>

            <div className="student-class-card__links">
              {session.completed ? (
                <span className="quiz-result-correct">
                  <Icon name="check" size={14} /> Marked complete
                </span>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={markComplete.isPending}
                  onClick={() => markComplete.mutate(session.id)}
                >
                  {markComplete.isPending ? "Marking…" : "Mark as complete"}
                </button>
              )}
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

            {session.materials.length > 0 && (
              <div className="card student-class-card">
                <h3>Materials</h3>
                <ul className="student-materials-list">
                  {session.materials.map((material) => (
                    <li key={material.id}>
                      <a href={material.fileUrl} target="_blank" rel="noreferrer" className="text-link">
                        <Icon name="book" size={14} /> {material.title}
                      </a>
                      {material.description && <p className="text-muted" style={{ margin: "2px 0 0" }}>{material.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {session.sections.length === 0 && (
              <div className="notice-panel">
                <Icon name="book" size={24} />
                <h3>Content is on its way.</h3>
                <p>Your instructor hasn't added lesson content for this class yet.</p>
              </div>
            )}

            {session.sections.length > 0 && <nav className="lesson-jump-nav" aria-label="Lesson sections">{session.sections.map((section, index) => <a key={index} href={`#lesson-section-${index}`}>{String(index + 1).padStart(2, "0")} ? {section.title}</a>)}</nav>}
            {session.sections.map((section, index) => (
              <div className="card student-class-card lesson-reading-card" id={`lesson-section-${index}`} key={index}>
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

            {session.assignment && <AssignmentSection key={`${session.assignment.id}-${session.assignment.mySubmission?.version??"new"}`} assignment={session.assignment} />}
          </>
        )}
      </div>
    </div>
  );
}
