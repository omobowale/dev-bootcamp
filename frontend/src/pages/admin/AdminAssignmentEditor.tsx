import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useAdminAssignment,
  useCreateAssignment,
  useUpdateAssignment,
} from "../../hooks/admin/useAdminAssignment";
import { LoadingState } from "../../components/LoadingState";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { Icon } from "../../components/Icon";
import { adminAssignmentSubmissionsPath } from "../../constants/routes";
import type { AdminAssignmentInput } from "../../types/admin";

const EMPTY_FORM: AdminAssignmentInput = {
  title: "",
  learningObjective: "",
  instructions: "",
  tasks: "",
  submissionRequirements: "",
  maxScore: 100,
  dueAt: null,
  rubric: "",
  allowedAttachmentTypes: "",
};

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function fromDateInput(value: string): string | null {
  if (!value) return null;
  return new Date(`${value}T23:59:59`).toISOString();
}

export function AdminAssignmentEditor({ classSessionId }: { classSessionId: number }) {
  const { data: assignment, isLoading } = useAdminAssignment(classSessionId);
  const createAssignment = useCreateAssignment(classSessionId);
  const updateAssignment = useUpdateAssignment(classSessionId);

  const [form, setForm] = useState<AdminAssignmentInput>(EMPTY_FORM);

  useEffect(() => {
    if (assignment) {
      const { id: _id, classSessionId: _csId, ...rest } = assignment;
      setForm(rest);
    }
  }, [assignment]);

  if (isLoading) return <LoadingState label="Loading assignment…" />;

  if (!assignment) {
    return (
      <button
        type="button"
        className="btn btn-secondary"
        onClick={() => createAssignment.mutate()}
        disabled={createAssignment.isPending}
      >
        <Icon name="plus" size={14} /> {createAssignment.isPending ? "Setting up…" : "Set up assignment"}
      </button>
    );
  }

  const updateField = <K extends keyof AdminAssignmentInput>(key: K, value: AdminAssignmentInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      <Link
        to={adminAssignmentSubmissionsPath(assignment.id)}
        className="text-link"
        style={{ marginBottom: 16, display: "inline-flex" }}
      >
        View submissions <Icon name="arrow" size={13} />
      </Link>

      <div className="admin-form-grid">
        <label className="form-field form-field--full">
          Title
          <input value={form.title} onChange={(e) => updateField("title", e.target.value)} />
        </label>

        <label className="form-field form-field--full">
          Learning objective
          <textarea
            rows={2}
            value={form.learningObjective ?? ""}
            onChange={(e) => updateField("learningObjective", e.target.value)}
          />
        </label>

        <label className="form-field form-field--full">
          Instructions
          <RichTextEditor
            value={form.instructions ?? ""}
            onChange={(value) => updateField("instructions", value)}
            placeholder="What should the student do?"
            minHeight={100}
          />
        </label>

        <label className="form-field form-field--full">
          Questions / tasks
          <RichTextEditor
            value={form.tasks ?? ""}
            onChange={(value) => updateField("tasks", value)}
            placeholder="Specific questions or tasks to complete"
            minHeight={100}
          />
        </label>

        <label className="form-field form-field--full">
          Submission requirements
          <textarea
            rows={2}
            value={form.submissionRequirements ?? ""}
            onChange={(e) => updateField("submissionRequirements", e.target.value)}
            placeholder="e.g. Submit a written response and a link to your GitHub repo"
          />
        </label>

        <label className="form-field">
          Max score
          <input
            type="number"
            min={1}
            value={form.maxScore}
            onChange={(e) => updateField("maxScore", Number(e.target.value))}
          />
        </label>

        <label className="form-field">
          Due date (optional)
          <input type="date" value={toDateInput(form.dueAt)} onChange={(e) => updateField("dueAt", fromDateInput(e.target.value))} />
        </label>

        <label className="form-field form-field--full">
          Allowed attachment types (optional)
          <input
            value={form.allowedAttachmentTypes ?? ""}
            onChange={(e) => updateField("allowedAttachmentTypes", e.target.value)}
            placeholder="e.g. .pdf, .zip, .docx"
          />
        </label>

        <label className="form-field form-field--full">
          Grading rubric
          <RichTextEditor
            value={form.rubric ?? ""}
            onChange={(value) => updateField("rubric", value)}
            placeholder="What you'll look for when scoring this — for your own reference while reviewing."
            minHeight={100}
          />
        </label>
      </div>

      <button
        type="button"
        className="btn btn-primary"
        disabled={updateAssignment.isPending}
        onClick={() => updateAssignment.mutate({ id: assignment.id, input: form })}
      >
        {updateAssignment.isPending ? "Saving…" : "Save assignment"}
      </button>
    </div>
  );
}
