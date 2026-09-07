import { Select } from "../../components/Select";
import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAdminRegistrations } from "../../hooks/admin/useAdminRegistrations";
import { useAdminCourses } from "../../hooks/admin/useAdminCourses";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { REGISTRATION_STATUSES } from "../../constants/adminOptions";
import { adminRegistrationDetailPath } from "../../constants/routes";
import { formatDate } from "../../utils/formatDate";
import type { RegistrationStatus } from "../../types/admin";
import "./adminShared.css";

export function AdminRegistrationsPage() {
  const [params, setParams] = useSearchParams();
  const status = (params.get('status') || '') as RegistrationStatus | '';
  const courseId = params.get('course') ? Number(params.get('course')) : '';
  const page = Math.max(0, Number(params.get('page')) || 0);
  const [search, setSearch] = useState(params.get('q') || '');
  const querySearch = params.get('q') || '';
  const update = useCallback((key: string, value: string) => setParams(previous => { const next = new URLSearchParams(previous); if (value) next.set(key, value); else next.delete(key); if (key !== 'page') next.delete('page'); return next; }, { replace: true }), [setParams]);
  useEffect(() => { setSearch(querySearch); }, [querySearch]);
  useEffect(() => { if (search === querySearch) return; const timer = setTimeout(() => update('q', search), 300); return () => clearTimeout(timer); }, [search, querySearch, update]);
  const setStatus = (value: string) => update('status', value);
  const setCourseId = (value: number | '') => update('course', String(value));
  const setPage = (value: number | ((page: number) => number)) => update('page', String(typeof value === 'function' ? value(page) : value));
  const { data: courses } = useAdminCourses();
  const { data, isLoading, isError, refetch } = useAdminRegistrations({
    status,
    courseId: courseId === "" ? undefined : courseId,
    search: querySearch,
    page,
  });

  const resetPageAnd = (fn: () => void) => {
    fn();
  };

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Registrations</h1>
          <p className="text-muted">Filter, search, and update registration status.</p>
        </div>
      </div>

      <div className="admin-filters">
        <input
          type="search"
          aria-label="Search registrations"
          placeholder="Search name, email or registration #"
          value={search}
          onChange={(e) => resetPageAnd(() => setSearch(e.target.value))}
          style={{ minWidth: 240 }}
        />
        <Select
          aria-label="Filter by status"
          value={status}
          onChange={(e) => resetPageAnd(() => setStatus(e.target.value as RegistrationStatus | ""))}
        >
          <option value="">All statuses</option>
          {REGISTRATION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select
          aria-label="Filter by course"
          value={courseId}
          onChange={(e) => resetPageAnd(() => setCourseId(e.target.value === "" ? "" : Number(e.target.value)))}
        >
          <option value="">All courses</option>
          {courses?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>

      {isLoading && <LoadingState label="Loading registrations…" />}
      {isError && <ErrorState message="Couldn't load registrations." onRetry={() => refetch()} />}

      {data && (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Registration #</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Cohort</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {data.content.length === 0 && (
                  <tr>
                    <td colSpan={7} className="admin-empty">
                      No registrations match these filters.
                    </td>
                  </tr>
                )}
                {data.content.map((reg) => (
                  <tr key={reg.id}>
                    <td data-label="Registration #">
                      <Link to={adminRegistrationDetailPath(reg.id)}>{reg.registrationNumber}</Link>
                    </td>
                    <td data-label="Name">{reg.fullName}</td>
                    <td data-label="Email">{reg.email}</td>
                    <td data-label="Course">{reg.courseTitle}</td>
                    <td data-label="Cohort">
                      {reg.cohortName}
                      {reg.privateTutorial && (
                        <span className="status-badge status-badge--open" style={{ marginLeft: 8 }}>
                          Private
                        </span>
                      )}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td data-label="Date">{formatDate(reg.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="admin-pagination">
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ← Previous
              </button>
              <span>
                Page {data.page + 1} of {data.totalPages} ({data.totalElements} total)
              </span>
              <button
                type="button"
                className="btn btn-secondary"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
