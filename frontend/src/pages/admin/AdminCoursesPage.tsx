import { useState } from "react";
import { Link } from "react-router-dom";
import { useAdminCourses, useArchiveCourse } from "../../hooks/admin/useAdminCourses";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { formatPrice } from "../../utils/formatCurrency";
import { ROUTES, adminCourseEditPath, adminCourseOutlinePath } from "../../constants/routes";
import "./adminShared.css";

export function AdminCoursesPage() {
  const { data: courses, isLoading, isError, refetch } = useAdminCourses();
  const archiveMutation = useArchiveCourse();
  const confirm = useConfirm();
  const [archivingId, setArchivingId] = useState<number | null>(null);

  const handleArchive = async (id: number, title: string) => {
    try {
    const ok = await confirm({
      title: `Unpublish "${title}"?`,
      description: "It will no longer be visible to the public, but all its content, modules, and cohorts are kept.",
      confirmLabel: "Unpublish",
      danger: true,
      icon: "alertTriangle",
    });
    if (!ok) return;
    setArchivingId(id);
    try {
      await archiveMutation.mutateAsync(id);
    } finally {
      setArchivingId(null);
    }
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Courses</h1>
          <p className="text-muted">Manage course content, modules, topics and FAQs.</p>
        </div>
        <Link to={ROUTES.adminNewCourse} className="btn btn-primary">
          + New course
        </Link>
      </div>

      {isLoading && <LoadingState label="Loading courses…" />}
      {isError && <ErrorState message="Couldn't load courses." onRetry={() => refetch()} />}

      {courses && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Level</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 && (
                <tr>
                  <td colSpan={5} className="admin-empty">
                    No courses yet. Create your first one.
                  </td>
                </tr>
              )}
              {courses.map((course) => (
                <tr key={course.id}>
                  <td data-label="Title">{course.title}</td>
                  <td data-label="Level">{course.level ?? "—"}</td>
                  <td data-label="Price">{formatPrice(course.price)}</td>
                  <td data-label="Status">
                    <span className={`status-badge status-badge--${course.published ? "open" : "closed"}`}>
                      {course.published ? "Published" : "Unpublished"}
                    </span>
                  </td>
                  <td data-label="Actions">
                    <div className="admin-actions-row">
                      <Link to={adminCourseEditPath(course.id)} className="text-link">
                        Edit
                      </Link>
                      <Link to={adminCourseOutlinePath(course.id)} className="text-link">
                        Outline & FAQs
                      </Link>
                      {course.published && (
                        <button
                          type="button"
                          className="text-link outline-btn-reset"
                          style={{ color: "var(--color-danger)" }}
                          onClick={() => handleArchive(course.id, course.title)}
                          disabled={archivingId === course.id}
                        >
                          {archivingId === course.id ? "Unpublishing…" : "Unpublish"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
