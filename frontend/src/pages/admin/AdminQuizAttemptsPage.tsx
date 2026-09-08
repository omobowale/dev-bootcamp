import { useNavigate, useParams } from "react-router-dom";
import { useAdminQuizAttempts } from "../../hooks/admin/useAdminQuiz";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Icon } from "../../components/Icon";
import { formatDateTime } from "../../utils/formatDate";
import "./adminShared.css";

export function AdminQuizAttemptsPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { data: attempts, isLoading, isError, refetch } = useAdminQuizAttempts(Number(quizId));

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">LMS · PHASE 10</span>
          <h1>Quiz attempts</h1>
          <p className="text-muted">Every attempt a student has made on this quiz.</p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>
          <Icon name="arrow" size={15} style={{ transform: "rotate(180deg)" }} /> Back
        </button>
      </div>

      {isLoading && <LoadingState label="Loading attempts…" />}
      {isError && <ErrorState message="Couldn't load attempts." onRetry={() => refetch()} />}

      {!isLoading && !isError && (attempts?.length ?? 0) === 0 && (
        <div className="notice-panel">
          <Icon name="clock" size={24} />
          <h3>No attempts yet.</h3>
          <p>Once a student takes this quiz, their result will show up here.</p>
        </div>
      )}

      {attempts && attempts.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Result</th>
                <th>Started</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td>
                    {attempt.studentName} <span className="text-muted">({attempt.studentId})</span>
                  </td>
                  <td>{attempt.score !== null ? `${attempt.score}/${attempt.totalPossible}` : "—"}</td>
                  <td>{attempt.percentage !== null ? `${attempt.percentage.toFixed(0)}%` : "—"}</td>
                  <td>
                    {attempt.passed === null ? (
                      <span className="text-muted">In progress</span>
                    ) : (
                      <span className={`status-badge ${attempt.passed ? "status-badge--active" : "status-badge--invited"}`}>
                        {attempt.passed ? "Passed" : "Failed"}
                      </span>
                    )}
                  </td>
                  <td>{formatDateTime(attempt.startedAt)}</td>
                  <td>{attempt.submittedAt ? formatDateTime(attempt.submittedAt) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
