import { ErrorState } from "../../components/ErrorState";
import { Select } from "../../components/Select";
import { useEffect, useState } from "react";
import { useAdminAttendance, useSaveAttendance } from "../../hooks/admin/useAdminAttendance";
import { LoadingState } from "../../components/LoadingState";
import type { AdminAttendanceRow, AttendanceEntry, AttendanceStatus } from "../../types/admin";

type AttendanceDraft = Omit<AttendanceEntry, "status"> & { status: AttendanceStatus | "" };
function toRowState(row: AdminAttendanceRow): AttendanceDraft {
  return {
    studentId: row.studentId,
    status: row.status ?? "",
    checkInTime: row.checkInTime,
    checkOutTime: row.checkOutTime,
    notes: row.notes,
  };
}

export function AdminAttendanceEditor({ classSessionId }: { classSessionId: number }) {
  const { data: rows, isLoading, isError, refetch } = useAdminAttendance(classSessionId);
  const saveAttendance = useSaveAttendance(classSessionId);
  const [entries, setEntries] = useState<Record<number, AttendanceDraft>>({});

  useEffect(() => {
    if (rows) {
      setEntries(Object.fromEntries(rows.map((row) => [row.studentId, toRowState(row)])));
    }
  }, [rows]);

  if (isLoading) return <LoadingState label="Loading attendance…" />;

  if (isError) return <ErrorState message="Could not load attendance." onRetry={() => refetch()} />;

  if (!rows || rows.length === 0) {
    return <p className="text-muted">No students are enrolled in this course yet.</p>;
  }

  const updateEntry = (studentId: number, patch: Partial<AttendanceDraft>) => {
    setEntries((prev) => ({ ...prev, [studentId]: { ...prev[studentId], ...patch } }));
  };

  const handleSave = () => {
    saveAttendance.mutate(Object.values(entries).filter((entry): entry is AttendanceEntry => entry.status !== ""));
  };

  return (
    <div>
      <div className="admin-table-wrapper" style={{ marginBottom: 16 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const entry = entries[row.studentId] ?? toRowState(row);
              return (
                <tr key={row.studentId}>
                  <td data-label="Student">
                    {row.studentName} <span className="text-muted">({row.studentCode})</span>
                  </td>
                  <td data-label="Status">
                    <Select
                      aria-label={`Attendance status for ${row.studentName}`}
                      value={entry.status}
                      onChange={(e) => updateEntry(row.studentId, { status: e.target.value as AttendanceStatus })}
                    >
                      <option value="" disabled>Unmarked</option>
                      <option value="PRESENT">Present</option>
                      <option value="ABSENT">Absent</option>
                    </Select>
                  </td>
                  <td data-label="Notes">
                    <input
                      aria-label={`Notes for ${row.studentName}`}
                      value={entry.notes ?? ""}
                      onChange={(e) => updateEntry(row.studentId, { notes: e.target.value || null })}
                      placeholder="Optional note"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button type="button" className="btn btn-primary" disabled={saveAttendance.isPending || !Object.values(entries).some(entry => entry.status !== "")} onClick={handleSave}>
        {saveAttendance.isPending ? "Saving…" : "Save attendance"}
      </button>
    </div>
  );
}
