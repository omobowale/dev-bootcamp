import { SubmissionHistory } from "../../components/SubmissionHistory";
import { Select } from "../../components/Select";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAdminSubmissions, useReviewSubmission } from "../../hooks/admin/useAdminAssignment";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Icon } from "../../components/Icon";
import { formatDateTime } from "../../utils/formatDate";
import type { AdminSubmission, AssignmentSubmissionStatus } from "../../types/admin";
import "./adminShared.css";

const STATUS_LABELS: Record<AssignmentSubmissionStatus, string> = {
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under review",
  REVIEWED: "Reviewed",
  NEEDS_RESUBMISSION: "Needs resubmission",
};

export function SubmissionCard({ submission, assignmentId }: { submission: AdminSubmission; assignmentId: number }) {
  const [score, setScore] = useState<string>(submission.score !== null ? String(submission.score) : "");
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [status, setStatus] = useState<AssignmentSubmissionStatus>(
    submission.status === "SUBMITTED" ? "UNDER_REVIEW" : submission.status,
  );
  const review = useReviewSubmission(assignmentId);

  const handleReview = () => {
    review.mutate({
      submissionId: submission.id,
      version: submission.version,
      status,
      score: status === "REVIEWED" ? Number(score) : null,
      feedback: feedback || null,
    });
  };

  return (
    <div className="card detail-section-card" style={{ marginBottom: 18 }}>
      <div className="admin-actions-row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <strong>{submission.studentName}</strong> <span className="text-muted">({submission.studentId})</span>
        </div>
        <span className={`status-badge ${submission.status === "REVIEWED" ? "status-badge--active" : "status-badge--invited"}`}>
          {STATUS_LABELS[submission.status]}
        </span>
      </div>

      <SubmissionHistory url={`/api/admin/assignment-submissions/${submission.id}/history`} />
      <p className="text-muted">Submitted {formatDateTime(submission.submittedAt)}</p>

      {submission.responseText && (
        <div className="summary-list" style={{ marginBottom: 12 }}>
          <p>{submission.responseText}</p>
        </div>
      )}

      {submission.attachmentUrl && (
        <a href={submission.attachmentUrl} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ marginBottom: 16 }}>
          <Icon name="download" size={14} /> {submission.attachmentFilename ?? "Download attachment"}
        </a>
      )}

      <div className="admin-form-grid">
        <label className="form-field">
          Status
          <Select value={status} onChange={(e) => setStatus(e.target.value as AssignmentSubmissionStatus)}>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="NEEDS_RESUBMISSION">Needs resubmission</option>
          </Select>
        </label>
        {status === "REVIEWED" && (
          <label className="form-field">
            Score
            <input type="number" min={0} value={score} onChange={(e) => setScore(e.target.value)} />
          </label>
        )}
        <label className="form-field form-field--full">
          Feedback
          <textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
        </label>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        disabled={review.isPending || (status === "REVIEWED" && score.trim() === "")}
        onClick={handleReview}
      >
        {review.isPending ? "Saving…" : "Save review"}
      </button>
    </div>
  );
}

export function AdminAssignmentSubmissionsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const assignmentIdNum = Number(assignmentId);
  const { data: submissions, isLoading, isError, refetch } = useAdminSubmissions(assignmentIdNum);

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">LEARNING MANAGEMENT</span>
          <h1>Assignment submissions</h1>
          <p className="text-muted">Review each student's response, score it, and leave feedback.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          <Icon name="arrow" size={15} style={{ transform: "rotate(180deg)" }} /> Back
        </button>
      </div>

      {isLoading && <LoadingState label="Loading submissions…" />}
      {isError && <ErrorState message="Couldn't load submissions." onRetry={() => refetch()} />}

      {!isLoading && !isError && (submissions?.length ?? 0) === 0 && (
        <div className="notice-panel">
          <Icon name="clock" size={24} />
          <h3>No submissions yet.</h3>
          <p>Once a student submits this assignment, it'll show up here.</p>
        </div>
      )}

      {submissions?.map((submission) => (
        <SubmissionCard key={`${submission.id}-${submission.version}`} submission={submission} assignmentId={assignmentIdNum} />
      ))}
    </div>
  );
}
