import { Icon } from "../../components/Icon";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAdminDashboard } from "../../hooks/admin/useAdminDashboard";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { formatDate } from "../../utils/formatDate";
import { ROUTES, adminRegistrationDetailPath } from "../../constants/routes";
import "./adminShared.css";

export function AdminDashboardPage() {
  const { admin } = useAuth();
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">YOUR WORKSPACE AT A GLANCE</span><h1>Welcome back, {admin?.name?.split(" ")[0]}.</h1>
          <p className="text-muted">Here's what's happening across the platform.</p>
        </div>
        <div className="admin-actions-row">
          <Link to={ROUTES.adminCourses} className="btn btn-secondary">
            Manage courses
          </Link>
          <Link to={ROUTES.adminRegistrations} className="btn btn-primary">
            View registrations
          </Link>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading dashboard…" />}
      {isError && <ErrorState message="Couldn't load dashboard metrics." onRetry={() => refetch()} />}

      {data && (
        <>
          <div className="dashboard-tasks"><Link to="/admin/registrations?status=NEW"><span className="metric-icon"><Icon name="users" /></span><div><strong>{data.registrationsByStatus.NEW ?? 0} learners awaiting a response</strong><span>Review new registrations</span></div><Icon name="arrow" size={18} /></Link><Link to="/admin/cohorts"><span className="metric-icon"><Icon name="calendar" /></span><div><strong>{data.openCohorts} open learning options</strong><span>Review dates and availability</span></div><Icon name="arrow" size={18} /></Link></div><div className="admin-welcome-banner"><div><h2>A little planning. A lot of possibility.</h2><p>Keep your courses current, your cohorts organised, and your learners moving forward.</p></div><Link to={ROUTES.adminNewCourse} className="btn btn-light">Create a course <Icon name="arrow" size={16} /></Link></div>
          <div className="admin-card-grid">
            <div className="card admin-metric-card"><span className="metric-icon"><Icon name="book" size={20} /></span>
              <span className="admin-metric-card__label">Published courses</span>
              <div className="admin-metric-card__value">
                {data.publishedCourses}/{data.totalCourses}
              </div>
            </div>
            <div className="card admin-metric-card"><span className="metric-icon"><Icon name="calendar" size={20} /></span>
              <span className="admin-metric-card__label">Open cohorts</span>
              <div className="admin-metric-card__value">
                {data.openCohorts}/{data.totalCohorts}
              </div>
            </div>
            <div className="card admin-metric-card"><span className="metric-icon"><Icon name="users" size={20} /></span>
              <span className="admin-metric-card__label">Total registrations</span>
              <div className="admin-metric-card__value">{data.totalRegistrations}</div>
            </div>
            <div className="card admin-metric-card"><span className="metric-icon"><Icon name="spark" size={20} /></span>
              <span className="admin-metric-card__label">New (unactioned)</span>
              <div className="admin-metric-card__value">{data.registrationsByStatus.NEW ?? 0}</div>
            </div>
          </div>

          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Recent registrations</h2>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Registration #</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      No registrations yet.
                    </td>
                  </tr>
                )}
                {data.recentRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td data-label="Registration #">
                      <Link to={adminRegistrationDetailPath(reg.id)}>{reg.registrationNumber}</Link>
                    </td>
                    <td data-label="Name">{reg.fullName}</td>
                    <td data-label="Course">{reg.courseTitle}</td>
                    <td data-label="Status">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td data-label="Date">{formatDate(reg.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
