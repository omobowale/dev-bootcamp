import { useState, type FormEvent } from "react";
import { Modal } from "../Modal";
import { Select } from "../Select";
import { useAdminCourses } from "../../hooks/admin/useAdminCourses";
import { useAdminCohorts } from "../../hooks/admin/useAdminCohorts";
import { useCreateManualEnrollment } from "../../hooks/admin/useAdminRegistrations";
import { EXPERIENCE_LEVELS } from "../../constants/registrationOptions";

export function ManualEnrollmentModal({ onClose }: { onClose: () => void }) {
  const { data: courses } = useAdminCourses();
  const { data: cohorts } = useAdminCohorts();
  const createEnrollment = useCreateManualEnrollment();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [courseId, setCourseId] = useState<number | "">("");
  const [cohortId, setCohortId] = useState<number | "">("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cohortsForCourse = cohorts?.filter((c) => c.courseId === courseId) ?? [];

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!fullName.trim() || !email.trim() || courseId === "" || cohortId === "") {
      setError("Name, email, course, and cohort are required.");
      return;
    }
    try {
      await createEnrollment.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        whatsappNumber: whatsappNumber.trim(),
        courseId,
        cohortId,
        experienceLevel,
        preferredTime: preferredTime.trim(),
      });
      onClose();
    } catch {
      setError("Couldn't create this enrollment. Check the details and try again.");
    }
  };

  return (
    <Modal onClose={onClose} labelledBy="manual-enrollment-title">
      <form onSubmit={handleSubmit}>
        <h2 id="manual-enrollment-title">Enroll a student manually</h2>
        <p className="text-muted" style={{ marginTop: 4 }}>
          For someone who registered by phone, WhatsApp, or in person. This confirms the
          registration immediately and sends the student their invite link.
        </p>

        {error && (
          <div className="form-error" role="alert" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}

        <div className="admin-form-grid" style={{ marginTop: 16 }}>
          <label className="form-field form-field--full">
            Full name
            <input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </label>
          <label className="form-field">
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="form-field">
            WhatsApp number
            <input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
          </label>
          <label className="form-field">
            Course
            <Select
              aria-label="Course"
              required
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value === "" ? "" : Number(e.target.value));
                setCohortId("");
              }}
            >
              <option value="">Select a course</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </Select>
          </label>
          <label className="form-field">
            Cohort
            <Select
              aria-label="Cohort"
              required
              value={cohortId}
              onChange={(e) => setCohortId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={courseId === ""}
            >
              <option value="">{courseId === "" ? "Select a course first" : "Select a cohort"}</option>
              {cohortsForCourse.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </label>
          <label className="form-field">
            Experience level (optional)
            <Select aria-label="Experience level" value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
              <option value="">Not specified</option>
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="form-field">
            Preferred time (optional)
            <input value={preferredTime} onChange={(e) => setPreferredTime(e.target.value)} placeholder="e.g. Weekday evenings" />
          </label>
        </div>

        <div className="admin-actions-row" style={{ marginTop: 20 }}>
          <button type="submit" className="btn btn-primary" disabled={createEnrollment.isPending}>
            {createEnrollment.isPending ? "Enrolling…" : "Enroll student"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
