import { useState } from "react";
import { Link } from "react-router-dom";
import { Select } from "../../components/Select";
import { useAdminStudents } from "../../hooks/admin/useAdminStudents";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { formatDate } from "../../utils/formatDate";
import "./adminShared.css";

export function AdminStudentsPage() {
  const [search,setSearch]=useState("");const [status,setStatus]=useState("");
  const { data: students, isLoading, isError, refetch } = useAdminStudents();

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">LEARNING MANAGEMENT</span>
          <h1>Students</h1>
          <p className="text-muted">
            Accounts are created automatically the moment a registration is marked Confirmed.
          </p>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading students…" />}
      {isError && <ErrorState message="Couldn't load students." onRetry={() => refetch()} />}

      <div className="admin-filters"><input aria-label="Search students" placeholder="Search name, email or student ID" value={search} onChange={e=>setSearch(e.target.value)}/><Select aria-label="Account status" value={status} onChange={e=>setStatus(e.target.value)}><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INVITED">Invited</option></Select></div>
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
              {students.filter(s=>(!status||s.status===status)&&`${s.fullName} ${s.email} ${s.studentId}`.toLowerCase().includes(search.toLowerCase())).map((student) => (
                <tr key={student.id}>
                  <td data-label="Student ID">{student.studentId}</td>
                  <td data-label="Name"><Link to={`/admin/students/${student.id}`}>{student.fullName}</Link></td>
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
