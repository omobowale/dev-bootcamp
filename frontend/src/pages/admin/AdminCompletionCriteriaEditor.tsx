import { useEffect, useState } from "react";
import { useCompletionCriteria, useUpdateCompletionCriteria } from "../../hooks/admin/useAdminCourses";
import { LoadingState } from "../../components/LoadingState";
import type { CourseCompletionCriteriaInput } from "../../types/admin";

export function AdminCompletionCriteriaEditor({ courseId }: { courseId: number }) {
  const { data: criteria, isLoading } = useCompletionCriteria(courseId);
  const update = useUpdateCompletionCriteria(courseId);

  const [form, setForm] = useState<CourseCompletionCriteriaInput>({
    requireAllClassesCompleted: true,
    requireAllQuizzesPassed: false,
    requireAllAssignmentsReviewed: false,
    minAttendancePercentage: null,
  });
  const [trackAttendance, setTrackAttendance] = useState(false);

  useEffect(() => {
    if (criteria) {
      const { courseId: _courseId, ...rest } = criteria;
      setForm(rest);
      setTrackAttendance(criteria.minAttendancePercentage !== null);
    }
  }, [criteria]);

  if (isLoading) return <LoadingState label="Loading completion criteria…" />;

  return (
    <div>
      <p className="text-muted" style={{ marginBottom: 16 }}>
        A student's enrollment counts as complete once every checked requirement below is met.
      </p>
      <div className="admin-checkbox-field">
        <input
          type="checkbox"
          id="requireAllClassesCompleted"
          checked={form.requireAllClassesCompleted}
          onChange={(e) => setForm((prev) => ({ ...prev, requireAllClassesCompleted: e.target.checked }))}
        />
        <label htmlFor="requireAllClassesCompleted">All classes marked complete by the student</label>
      </div>
      <div className="admin-checkbox-field">
        <input
          type="checkbox"
          id="requireAllQuizzesPassed"
          checked={form.requireAllQuizzesPassed}
          onChange={(e) => setForm((prev) => ({ ...prev, requireAllQuizzesPassed: e.target.checked }))}
        />
        <label htmlFor="requireAllQuizzesPassed">All quizzes passed</label>
      </div>
      <div className="admin-checkbox-field">
        <input
          type="checkbox"
          id="requireAllAssignmentsReviewed"
          checked={form.requireAllAssignmentsReviewed}
          onChange={(e) => setForm((prev) => ({ ...prev, requireAllAssignmentsReviewed: e.target.checked }))}
        />
        <label htmlFor="requireAllAssignmentsReviewed">All assignments reviewed by an admin</label>
      </div>
      <div className="admin-checkbox-field">
        <input
          type="checkbox"
          id="trackAttendance"
          checked={trackAttendance}
          onChange={(e) => {
            setTrackAttendance(e.target.checked);
            if (!e.target.checked) setForm((prev) => ({ ...prev, minAttendancePercentage: null }));
            else setForm((prev) => ({ ...prev, minAttendancePercentage: prev.minAttendancePercentage ?? 80 }));
          }}
        />
        <label htmlFor="trackAttendance">Minimum attendance percentage required</label>
      </div>
      {trackAttendance && (
        <label className="form-field" style={{ maxWidth: 200, marginLeft: 26 }}>
          Minimum attendance %
          <input
            type="number"
            min={1}
            max={100}
            value={form.minAttendancePercentage ?? 80}
            onChange={(e) => setForm((prev) => ({ ...prev, minAttendancePercentage: Number(e.target.value) }))}
          />
        </label>
      )}

      <button
        type="button"
        className="btn btn-primary"
        style={{ marginTop: 12 }}
        disabled={update.isPending}
        onClick={() => update.mutate(form)}
      >
        {update.isPending ? "Saving…" : "Save completion criteria"}
      </button>
    </div>
  );
}
