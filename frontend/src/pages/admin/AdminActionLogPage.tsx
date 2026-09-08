import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAdminActionLogs } from "../../hooks/admin/useAdminActionLogs";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { formatDateTime } from "../../utils/formatDate";
import "./adminShared.css";

export function AdminActionLogPage() {
  const [params, setParams] = useSearchParams();
  const entityType = params.get("type") || "";
  const page = Math.max(0, Number(params.get("page")) || 0);
  const [search, setSearch] = useState(params.get("q") || "");
  const querySearch = params.get("q") || "";

  const update = useCallback(
    (key: string, value: string) =>
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          if (value) next.set(key, value);
          else next.delete(key);
          if (key !== "page") next.delete("page");
          return next;
        },
        { replace: true },
      ),
    [setParams],
  );

  useEffect(() => {
    setSearch(querySearch);
  }, [querySearch]);
  useEffect(() => {
    if (search === querySearch) return;
    const timer = setTimeout(() => update("q", search), 300);
    return () => clearTimeout(timer);
  }, [search, querySearch, update]);

  const setPage = (value: number | ((page: number) => number)) =>
    update("page", String(typeof value === "function" ? value(page) : value));

  const { data, isLoading, isError, refetch } = useAdminActionLogs({ entityType, search: querySearch, page });

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Activity log</h1>
          <p className="text-muted">Every admin action across the platform, most recent first.</p>
        </div>
      </div>

      <div className="admin-filters">
        <input
          type="search"
          aria-label="Search activity"
          placeholder="Search action, details or admin"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 260 }}
        />
        <input
          type="text"
          aria-label="Filter by entity type"
          placeholder="Entity type (e.g. Course, Registration)"
          value={entityType}
          onChange={(e) => update("type", e.target.value)}
          style={{ minWidth: 240 }}
        />
      </div>

      {isLoading && <LoadingState label="Loading activity…" />}
      {isError && <ErrorState message="Couldn't load the activity log." onRetry={() => refetch()} />}

      {data && (
        <>
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Admin</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {data.content.length === 0 && (
                  <tr>
                    <td colSpan={5} className="admin-empty">
                      No activity matches these filters.
                    </td>
                  </tr>
                )}
                {data.content.map((entry, index) => (
                  <tr key={index}>
                    <td data-label="When">{formatDateTime(entry.createdAt)}</td>
                    <td data-label="Admin">{entry.adminName}</td>
                    <td data-label="Action">{entry.action}</td>
                    <td data-label="Entity">
                      {entry.entityType ? `${entry.entityType}${entry.entityId ? ` #${entry.entityId}` : ""}` : "—"}
                    </td>
                    <td data-label="Details">{entry.details ?? "—"}</td>
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
