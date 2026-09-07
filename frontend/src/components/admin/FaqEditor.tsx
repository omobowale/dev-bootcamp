import { sanitizeRichText } from "../../utils/richText";
import { useState } from "react";
import { useDeleteFaq, useUpdateFaq } from "../../hooks/admin/useAdminFaqs";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { RichTextEditor } from "./RichTextEditor";
import { Icon } from "../Icon";
import type { AdminFaq } from "../../types/admin";

/** courseId null means this edits a global FAQ (About/FAQ/Contact page), not a per-course one. */
export function FaqEditor({ faq, courseId }: { faq: AdminFaq; courseId: number | null }) {
  const [editing, setEditing] = useState(false);
  const [question, setQuestion] = useState(faq.question);
  const [answer, setAnswer] = useState(faq.answer);
  const updateFaq = useUpdateFaq(courseId ?? undefined);
  const deleteFaq = useDeleteFaq(courseId ?? undefined);
  const confirm = useConfirm();

  const handleSave = async () => {
    try {
    await updateFaq.mutateAsync({ id: faq.id, input: { courseId, question, answer, position: faq.position } });
    setEditing(false);
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  const handleDelete = async () => {
    try {
    const ok = await confirm({
      title: "Delete this FAQ?",
      description: `"${faq.question}" will be permanently removed from the ${courseId ? "course" : "site"} FAQ list.`,
      confirmLabel: "Delete",
      danger: true,
      icon: "trash",
    });
    if (ok) deleteFaq.mutate(faq.id);
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  if (editing) {
    return (
      <div className="card faq-card faq-card--editing">
        <label className="form-field">
          Question
          <input value={question} onChange={(e) => setQuestion(e.target.value)} />
        </label>
        <label className="form-field">
          Answer
          <RichTextEditor value={answer} onChange={setAnswer} placeholder="Write the answer…" minHeight={90} />
        </label>
        <div className="admin-actions-row">
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={updateFaq.isPending || !question.trim() || !answer.trim()}>
            {updateFaq.isPending ? "Saving…" : "Save"}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => { setQuestion(faq.question); setAnswer(faq.answer); setEditing(false); }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card faq-card">
      <span className="faq-card__icon">
        <Icon name="mail" size={16} />
      </span>
      <div className="faq-card__body">
        <strong>{faq.question}</strong>
        <div className="rich-content text-muted faq-card__answer" dangerouslySetInnerHTML={{ __html: sanitizeRichText(faq.answer) }} />
      </div>
      <div className="faq-card__actions">
        <button type="button" className="icon-btn" title="Edit" aria-label="Edit FAQ" onClick={() => { setQuestion(faq.question); setAnswer(faq.answer); setEditing(true); }}>
          <Icon name="edit" size={15} />
        </button>
        <button
          type="button"
          className="icon-btn icon-btn--danger"
          title="Delete"
          aria-label="Delete FAQ"
          onClick={handleDelete}
        >
          <Icon name="trash" size={15} />
        </button>
      </div>
    </div>
  );
}
