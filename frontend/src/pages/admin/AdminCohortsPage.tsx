import { Checkbox } from "../../components/Checkbox";
import { Select } from "../../components/Select";
import { useMemo, useState, type FormEvent } from "react";
import { useAdminCourses } from "../../hooks/admin/useAdminCourses";
import { useAdminCohorts, useArchiveCohort, useCreateCohort, useUpdateCohort } from "../../hooks/admin/useAdminCohorts";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { StatusBadge } from "../../components/admin/StatusBadge";
import { COHORT_STATUSES } from "../../constants/adminOptions";
import { formatDateRange } from "../../utils/formatDate";
import type { AdminCohort, AdminCohortInput } from "../../types/admin";
import "./adminShared.css";

const EMPTY_FORM: AdminCohortInput = {
  name: "",
  startDate: null,
  endDate: null,
  schedule: "",
  time: "",
  mode: "Online",
  location: "",
  capacity: null,
  status: "OPEN",
  privateTutorial: false,
};

export function AdminCohortsPage() {
  const { data: courses } = useAdminCourses();
  const { data: cohorts, isLoading, isError, refetch } = useAdminCohorts();
  const createMutation = useCreateCohort();
  const updateMutation = useUpdateCohort();
  const archiveMutation = useArchiveCohort();
  const confirm = useConfirm();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [form, setForm] = useState<AdminCohortInput>(EMPTY_FORM);

  const courseTitleById = useMemo(() => {
    const map = new Map<number, string>();
    courses?.forEach((c) => map.set(c.id, c.title));
    return map;
  }, [courses]);

  const updateField = <K extends keyof AdminCohortInput>(key: K, value: AdminCohortInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setSelectedCourseId("");
    setShowForm(true);
  };

  const startEdit = (cohort: AdminCohort) => {
    setEditingId(cohort.id);
    setSelectedCourseId(cohort.courseId);
    setForm({
      name: cohort.name,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      schedule: cohort.schedule,
      time: cohort.time,
      mode: cohort.mode,
      location: cohort.location,
      capacity: cohort.capacity,
      status: cohort.status,
      privateTutorial: cohort.privateTutorial,
    });
    setShowForm(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    try {
    event.preventDefault();
    if (!form.name.trim() || selectedCourseId === "") return;

    if (editingId) {
      await updateMutation.mutateAsync({ id: editingId, input: form });
    } else {
      await createMutation.mutateAsync({ courseId: selectedCourseId, input: form });
    }
    setShowForm(false);
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  const handleArchive = async (cohort: AdminCohort) => {
    try {
    const ok = await confirm({
      title: `Close "${cohort.name}"?`,
      description: "New students won't be able to register for this cohort. Existing registrations are unaffected.",
      confirmLabel: "Close cohort",
      danger: true,
      icon: "alertTriangle",
    });
    if (ok) archiveMutation.mutate(cohort.id);
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <h1>Cohorts</h1>
          <p className="text-muted">Manage course cohorts, schedules and capacity.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={startCreate}>
          + New cohort
        </button>
      </div>

      {showForm && (
        <form className="card" style={{ padding: 28, marginBottom: 28, maxWidth: 640 }} onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="form-field form-field--full">
              Course
              <Select aria-label="Course"
                data-testid="cohort-course-select"
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value === "" ? "" : Number(e.target.value))}
                disabled={editingId !== null}
                required
              >
                <option value="">Select a course</option>
                {courses?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </Select>
            </label>

            <label className="form-field form-field--full">
              Cohort name
              <input
                data-testid="cohort-name-input"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </label>

            <label className="admin-checkbox-field form-field--full">
              <Checkbox
                
                checked={form.privateTutorial}
                onChange={(e) => updateField("privateTutorial", e.target.checked)}
              />
              Private tutorial (1-on-1, no fixed schedule — students submit a preferred time when registering)
            </label>

            <label className="form-field">
              Start date
              <input type="date" value={form.startDate ?? ""} onChange={(e) => updateField("startDate", e.target.value || null)} />
            </label>

            <label className="form-field">
              End date
              <input type="date" value={form.endDate ?? ""} onChange={(e) => updateField("endDate", e.target.value || null)} />
            </label>

            <label className="form-field">
              Schedule
              <input
                value={form.schedule ?? ""}
                onChange={(e) => updateField("schedule", e.target.value)}
                placeholder="Mon/Wed/Fri"
              />
            </label>

            <label className="form-field">
              Time
              <input value={form.time ?? ""} onChange={(e) => updateField("time", e.target.value)} placeholder="6–8 PM WAT (UTC+1)" />
            </label>

            <label className="form-field">
              Location
              <input value={form.location ?? ""} onChange={(e) => updateField("location", e.target.value)} />
            </label>

            <label className="form-field">
              Capacity
              <input
                type="number"
                min="1"
                value={form.capacity ?? ""}
                onChange={(e) => updateField("capacity", e.target.value === "" ? null : Number(e.target.value))}
              />
            </label>

            <label className="form-field">
              Status
              <Select aria-label="Cohort status" value={form.status} onChange={(e) => updateField("status", e.target.value as AdminCohortInput["status"])}>
                {COHORT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="admin-actions-row">
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save cohort"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading && <LoadingState label="Loading cohorts…" />}
      {isError && <ErrorState message="Couldn't load cohorts." onRetry={() => refetch()} />}

      {cohorts && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cohort</th>
                <th>Course</th>
                <th>Dates</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">
                    No cohorts yet.
                  </td>
                </tr>
              )}
              {cohorts.map((cohort) => (
                <tr key={cohort.id}>
                  <td data-label="Cohort">
                    {cohort.name}
                    {cohort.privateTutorial && (
                      <span className="status-badge status-badge--open" style={{ marginLeft: 8 }}>
                        Private
                      </span>
                    )}
                  </td>
                  <td data-label="Course">{courseTitleById.get(cohort.courseId) ?? "—"}</td>
                  <td data-label="Dates">{cohort.privateTutorial ? "Flexible" : formatDateRange(cohort.startDate, cohort.endDate) ?? "—"}</td>
                  <td data-label="Capacity">{cohort.privateTutorial ? "Per request" : cohort.capacity ?? "Unlimited"}</td>
                  <td data-label="Status">
                    <StatusBadge status={cohort.status} />
                  </td>
                  <td data-label="Actions">
                    <div className="admin-actions-row">
                      <button type="button" className="text-link outline-btn-reset" onClick={() => startEdit(cohort)}>
                        Edit
                      </button>
                      {cohort.status !== "CLOSED" && (
                        <button
                          type="button"
                          className="text-link outline-btn-reset"
                          style={{ color: "var(--color-danger)" }}
                          onClick={() => handleArchive(cohort)}
                        >
                          Close
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
