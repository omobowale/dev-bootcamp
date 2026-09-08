import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  useAdminClassSession,
  useAdminModules,
  useCreateClassSession,
  useUpdateClassSession,
} from "../../hooks/admin/useAdminModules";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { AdminQuizEditor } from "./AdminQuizEditor";
import { Icon } from "../../components/Icon";
import { ROUTES, adminCourseOutlinePath } from "../../constants/routes";
import type { AdminClassSessionInput, LessonSectionInput } from "../../types/admin";
import "./adminShared.css";
import "./AdminCourseOutlinePage.css";
import "./AdminCourseFormPage.css";

const EMPTY_FORM: AdminClassSessionInput = {
  topicId: null,
  title: "",
  objectives: "",
  scheduledAt: null,
  meetingLink: "",
  recordingUrl: "",
  position: 1,
  sections: [],
};

function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function AdminClassSessionFormPage() {
  const params = useParams<{ courseId: string; moduleId: string; classSessionId?: string }>();
  const courseId = Number(params.courseId);
  const moduleId = Number(params.moduleId);
  const isEditing = Boolean(params.classSessionId);
  const classSessionId = params.classSessionId ? Number(params.classSessionId) : undefined;
  const navigate = useNavigate();

  const { data: modules } = useAdminModules(courseId);
  const module = modules?.find((m) => m.id === moduleId);

  const {
    data: existing,
    isLoading,
    isError,
    refetch,
  } = useAdminClassSession(classSessionId ?? -1);
  const createMutation = useCreateClassSession(courseId);
  const updateMutation = useUpdateClassSession(courseId);

  const [form, setForm] = useState<AdminClassSessionInput>(EMPTY_FORM);
  const savedNavigation = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    JSON.stringify(form) !== JSON.stringify(existing ?? EMPTY_FORM) &&
    !createMutation.isSuccess &&
    !updateMutation.isSuccess;
  useUnsavedChanges(dirty, savedNavigation);

  useEffect(() => {
    if (existing) {
      const { id: _id, moduleId: _moduleId, ...rest } = existing;
      setForm(rest);
    } else if (!isEditing && module) {
      setForm((prev) => ({ ...prev, position: module.topics.length + module.classSessions.length + 1 }));
    }
  }, [existing, isEditing, module]);

  const updateField = <K extends keyof AdminClassSessionInput>(key: K, value: AdminClassSessionInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSection = (index: number, section: LessonSectionInput) => {
    setForm((prev) => ({ ...prev, sections: prev.sections.map((s, i) => (i === index ? section : s)) }));
  };
  const addSection = () => {
    setForm((prev) => ({ ...prev, sections: [...prev.sections, { title: "", body: "" }] }));
  };
  const removeSection = (index: number) => {
    setForm((prev) => ({ ...prev, sections: prev.sections.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    const payload: AdminClassSessionInput = {
      ...form,
      sections: form.sections.filter((s) => s.title.trim() !== ""),
    };

    try {
      if (isEditing && classSessionId) {
        await updateMutation.mutateAsync({ id: classSessionId, input: payload });
      } else {
        await createMutation.mutateAsync({ moduleId, input: payload });
      }
      savedNavigation.current = true;
      navigate(adminCourseOutlinePath(courseId));
    } catch {
      setError("Couldn't save this class. Please try again.");
    }
  };

  if (isEditing && isLoading) {
    return <LoadingState label="Loading class…" />;
  }

  if (isEditing && (isError || !existing)) {
    return <ErrorState message="This class couldn’t be loaded. It may no longer exist." onRetry={() => refetch()} />;
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">LMS · PHASE 9</span>
          <h1>{isEditing ? "Edit class" : "New class"}</h1>
          <p className="text-muted">
            {module ? `Part of "${module.title}". ` : ""}
            Gated lesson content — only enrolled students can see this.
          </p>
        </div>
        <Link to={adminCourseOutlinePath(courseId)} className="btn btn-secondary">
          <Icon name="arrow" size={15} style={{ transform: "rotate(180deg)" }} /> Back to outline
        </Link>
      </div>

      <form className="card admin-form-panel" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <section className="course-form-section">
          <div className="admin-form-grid">
            <label className="form-field form-field--full">
              Class title
              <input
                required
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g. Introduction to React Hooks"
              />
            </label>

            {module && module.topics.length > 0 && (
              <label className="form-field form-field--full">
                Linked public topic (optional)
                <select
                  value={form.topicId ?? ""}
                  onChange={(e) => updateField("topicId", e.target.value ? Number(e.target.value) : null)}
                >
                  <option value="">None</option>
                  {module.topics.map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.title}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="form-field form-field--full">
              Objectives
              <RichTextEditor
                value={form.objectives ?? ""}
                onChange={(value) => updateField("objectives", value)}
                placeholder="What will students be able to do after this class?"
                minHeight={80}
              />
            </label>

            <label className="form-field">
              Live class date &amp; time (optional)
              <input
                type="datetime-local"
                value={toDatetimeLocal(form.scheduledAt)}
                onChange={(e) => updateField("scheduledAt", fromDatetimeLocal(e.target.value))}
              />
            </label>

            <label className="form-field">
              Meeting link (optional)
              <input
                value={form.meetingLink ?? ""}
                onChange={(e) => updateField("meetingLink", e.target.value)}
                placeholder="https://meet.google.com/…"
              />
            </label>

            <label className="form-field">
              Recording URL (optional)
              <input
                value={form.recordingUrl ?? ""}
                onChange={(e) => updateField("recordingUrl", e.target.value)}
                placeholder="https://…"
              />
            </label>
          </div>
        </section>

        <section className="course-form-section">
          <div className="outline-section-heading" style={{ marginBottom: 18 }}>
            <span className="outline-section-heading__icon">
              <Icon name="layers" size={16} />
            </span>
            <div>
              <h2 style={{ margin: 0 }}>Lesson content</h2>
              <p className="text-muted" style={{ margin: "2px 0 0" }}>
                Ordered sections of rich content a student reads through.
              </p>
            </div>
          </div>

          {form.sections.map((section, index) => (
            <div className="content-entry" key={index}>
              <div className="admin-form-grid">
                <label className="form-field form-field--full">
                  Section title
                  <input
                    required
                    value={section.title}
                    onChange={(e) => updateSection(index, { ...section, title: e.target.value })}
                    placeholder="e.g. Why hooks exist"
                  />
                </label>
                <label className="form-field form-field--full">
                  Content
                  <RichTextEditor
                    value={section.body ?? ""}
                    onChange={(value) => updateSection(index, { ...section, body: value })}
                    placeholder="Write this section's content…"
                    minHeight={140}
                  />
                </label>
              </div>
              <div className="content-entry__actions">
                <button type="button" className="btn btn-secondary" onClick={() => removeSection(index)}>
                  Remove section
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addSection}>
            <Icon name="plus" size={14} /> Add section
          </button>
        </section>

        <div className="admin-actions-row">
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save class"}
          </button>
          <Link to={ROUTES.adminCourses} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>

      {isEditing && classSessionId && (
        <div className="card admin-form-panel">
          <div className="outline-section-heading" style={{ marginBottom: 18 }}>
            <span className="outline-section-heading__icon">
              <Icon name="check" size={16} />
            </span>
            <div>
              <h2 style={{ margin: 0 }}>Quiz</h2>
              <p className="text-muted" style={{ margin: "2px 0 0" }}>
                Auto-graded multiple-choice questions for this class. Saved independently of the class form above.
              </p>
            </div>
          </div>
          <AdminQuizEditor classSessionId={classSessionId} />
        </div>
      )}
    </div>
  );
}
