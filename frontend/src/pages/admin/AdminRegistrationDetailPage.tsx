import { Select } from "../../components/Select";
import { useState, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import {
  useAdminRegistration,
  useAdminRegistrationActivity,
  useUpdateRegistrationStatus,
} from "../../hooks/admin/useAdminRegistrations";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { Icon } from "../../components/Icon";
import { REGISTRATION_STATUSES } from "../../constants/adminOptions";
import { ROUTES } from "../../constants/routes";
import { formatDate, formatDateTime } from "../../utils/formatDate";
import type { RegistrationStatus } from "../../types/admin";
import "./adminShared.css";
import "./AdminCourseOutlinePage.css";

const ACTION_LABELS: Record<string, string> = {
  UPDATE_STATUS: "Status updated",
};

function SummaryRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="summary-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function AdminRegistrationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const registrationId = Number(id);
  const { data: registration, isLoading, isError, refetch } = useAdminRegistration(registrationId);
  const { data: activity, isLoading: activityLoading } = useAdminRegistrationActivity(registrationId);
  const updateStatus = useUpdateRegistrationStatus(registrationId);
  const [pendingStatus, setPendingStatus] = useState<RegistrationStatus | "">("");

  if (isLoading) return <LoadingState label="Loading registration…" />;
  if (isError || !registration) {
    return (
      <div className="container admin-page">
        <ErrorState message="Couldn't load this registration." onRetry={() => refetch()} />
      </div>
    );
  }

  const handleUpdateStatus = async () => {
    try {
      if (!pendingStatus) return;
      await updateStatus.mutateAsync(pendingStatus);
      setPendingStatus("");
    } catch {
      /* Mutation feedback is displayed by the shared toast system. */
    }
  };

  return (
    <div className="container admin-page" style={{ maxWidth: 980 }}>
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">REGISTRATION</span>
          <h1>{registration.fullName}</h1>
        </div>
        <Link to={ROUTES.adminRegistrations} className="btn btn-secondary">
          <Icon name="arrow" size={15} style={{ transform: "rotate(180deg)" }} /> Back to registrations
        </Link>
      </div>

      <div className="detail-page-layout">
        <div className="detail-page-main">
          <div className="card detail-header-card">
            <div className="detail-header-card__top">
              <span className="detail-header-card__ref">{registration.registrationNumber}</span>
              <StatusBadge status={registration.status} />
            </div>
            <h2>{registration.fullName}</h2>
            <p className="text-muted">
              {registration.courseTitle} · {registration.cohortName}
              {registration.privateTutorial ? " (Private tutorial)" : ""}
            </p>
            <p className="detail-header-card__meta">Registered {formatDateTime(registration.createdAt)}</p>
            <p className="detail-header-card__meta">
              {registration.studentId ? (
                <>
                  Student account: <strong>{registration.studentId}</strong> ·{" "}
                  <Link to={ROUTES.adminStudents} className="text-link">
                    View students
                  </Link>
                </>
              ) : (
                "No student account yet — created automatically once this registration is Confirmed."
              )}
            </p>
          </div>

          <div className="card detail-section-card">
            <h3>Contact & registration details</h3>
            <div className="summary-list">
              <SummaryRow label="Full name" value={registration.fullName} />
              <SummaryRow label="Email" value={registration.email} />
              <SummaryRow label="WhatsApp number" value={registration.whatsappNumber} />
              <SummaryRow label="Course" value={registration.courseTitle} />
              <SummaryRow
                label="Cohort"
                value={registration.cohortName + (registration.privateTutorial ? " (Private tutorial)" : "")}
              />
              {registration.preferredTime && <SummaryRow label="Preferred time" value={registration.preferredTime} />}
              <SummaryRow label="Experience level" value={registration.experienceLevel ?? "Not provided"} />
              <SummaryRow label="Referral source" value={registration.referralSource ?? "Not provided"} />
              <SummaryRow label="Consent given" value={registration.consentGiven ? "Yes" : "No"} />
              <SummaryRow label="Last updated" value={formatDate(registration.updatedAt)} />
            </div>
          </div>

          <div className="card detail-section-card">
            <h3>Update status</h3>
            <div className="admin-actions-row">
              <Select
                aria-label="New registration status"
                value={pendingStatus}
                onChange={(e) => setPendingStatus(e.target.value as RegistrationStatus)}
              >
                <option value="">Select new status</option>
                {REGISTRATION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value} disabled={s.value === registration.status}>
                    {s.label}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!pendingStatus || updateStatus.isPending}
                onClick={handleUpdateStatus}
              >
                {updateStatus.isPending ? "Updating…" : "Update status"}
              </button>
            </div>
          </div>
        </div>

        <aside className="detail-page-side">
          <div className="card detail-section-card">
            <div className="outline-section-heading" style={{ marginBottom: 18 }}>
              <span className="outline-section-heading__icon">
                <Icon name="clock" size={16} />
              </span>
              <div>
                <h3 style={{ margin: 0 }}>Activity</h3>
                <p className="text-muted" style={{ margin: "2px 0 0" }}>
                  Every change made to this registration.
                </p>
              </div>
            </div>

            {activityLoading && <LoadingState label="Loading activity…" />}

            {!activityLoading && (
              <ul className="activity-timeline">
                {activity?.map((entry, index) => (
                  <li key={index}>
                    <span className="activity-timeline__dot" />
                    <div>
                      <strong>{ACTION_LABELS[entry.action] ?? entry.action}</strong>
                      {entry.details && <p>{entry.details}</p>}
                      <span className="activity-timeline__meta">
                        {entry.adminName} · {formatDateTime(entry.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
                <li>
                  <span className="activity-timeline__dot activity-timeline__dot--start" />
                  <div>
                    <strong>Registration submitted</strong>
                    <span className="activity-timeline__meta">{formatDateTime(registration.createdAt)}</span>
                  </div>
                </li>
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
