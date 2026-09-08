import { useRubric,RubricBreakdown } from "../../components/AssignmentRubric";
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
  const rubric=useRubric(assignmentId);
  const [criterionScores,setCriterionScores]=useState<Record<string,string>>(()=>Object.fromEntries((submission.rubricBreakdown??[]).map(m=>[m.id,String(m.points)])));
  const [criterionFeedback,setCriterionFeedback]=useState<Record<string,string>>(()=>Object.fromEntries((submission.rubricBreakdown??[]).map(m=>[m.id,m.feedback??""])));
  const structured=Boolean(rubric.data?.criteria.length);
  const completeRubric=rubric.data?.criteria.every(c=>criterionScores[c.id]!==undefined&&criterionScores[c.id]!==""&&Number.isInteger(Number(criterionScores[c.id]))&&Number(criterionScores[c.id])>=0&&Number(criterionScores[c.id])<=c.maxPoints);
  const rubricTotal=rubric.data?.criteria.reduce((sum,c)=>sum+Number(criterionScores[c.id]||0),0)??0;

  const handleReview = () => {
    review.mutate({
      rubricVersion: rubric.data?.version,
      criterionScores: structured&&status==="REVIEWED"?rubric.data!.criteria.map(c=>({id:c.id,points:Number(criterionScores[c.id]),feedback:criterionFeedback[c.id]||""})):undefined,
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

      {submission.rubricBreakdown&&<RubricBreakdown marks={submission.rubricBreakdown}/>}
      {rubric.isError&&<ErrorState message="Could not load grading criteria." onRetry={()=>rubric.refetch()}/>}
      {structured&&status==="REVIEWED"&&<section className="rubric-criteria" aria-label="Criterion scores">{rubric.data!.criteria.map(c=><article key={c.id} className="rubric-criterion"><div className="rubric-criterion__heading"><strong>{c.label}</strong><span>/{c.maxPoints} points</span></div><p className="text-muted">{c.description}</p><label className="form-field">Points for {c.label}<input type="number" min={0} max={c.maxPoints} step={1} value={criterionScores[c.id]??""} onChange={e=>setCriterionScores(values=>({...values,[c.id]:e.target.value}))}/></label><label className="form-field">Feedback for {c.label}<textarea rows={2} maxLength={2000} value={criterionFeedback[c.id]??""} onChange={e=>setCriterionFeedback(values=>({...values,[c.id]:e.target.value}))}/></label></article>)}<p className="rubric-points">Total: {rubricTotal} / {rubric.data!.maxScore}</p></section>}
      <div className="admin-form-grid">
        <label className="form-field">
          Status
          <Select value={status} onChange={(e) => setStatus(e.target.value as AssignmentSubmissionStatus)}>
            <option value="UNDER_REVIEW">Under review</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="NEEDS_RESUBMISSION">Needs resubmission</option>
          </Select>
        </label>
        {status === "REVIEWED" && !structured && (
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
        disabled={review.isPending || !rubric.data || (status === "REVIEWED" && (structured ? !completeRubric : score.trim() === ""))}
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
