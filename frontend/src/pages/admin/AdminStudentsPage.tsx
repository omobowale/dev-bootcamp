import { useAdminStudents } from "../../hooks/admin/useAdminStudents";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { formatDate } from "../../utils/formatDate";
import "./adminShared.css";

export function AdminStudentsPage() {
  const { data: students, isLoading, isError, refetch } = useAdminStudents();

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">LMS · PHASE 8</span>
          <h1>Students</h1>
          <p className="text-muted">
            Accounts are created automatically the moment a registration is marked Confirmed.
          </p>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading students…" />}
      {isError && <ErrorState message="Couldn't load students." onRetry={() => refetch()} />}

      {students && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Courses</th>
                <th>Since</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    No students yet — they're created automatically when a registration is confirmed.
                  </td>
                </tr>
              )}
              {students.map((student) => (
                <tr key={student.id}>
                  <td data-label="Student ID">{student.studentId}</td>
                  <td data-label="Name">{student.fullName}</td>
                  <td data-label="Email">{student.email}</td>
                  <td data-label="Status">
                    <span className={`status-badge status-badge--${student.status.toLowerCase()}`}>
                      {student.status === "ACTIVE" ? "Active" : "Invited"}
                    </span>
                  </td>
                  <td data-label="Courses">{student.enrolledCourseTitles.join(", ") || "—"}</td>
                  <td data-label="Since">{formatDate(student.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
