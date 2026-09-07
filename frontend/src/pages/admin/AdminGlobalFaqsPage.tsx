import { useState, type FormEvent } from "react";
import { useAdminFaqs, useCreateFaq } from "../../hooks/admin/useAdminFaqs";
import { FaqEditor } from "../../components/admin/FaqEditor";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Icon } from "../../components/Icon";
import "./adminShared.css";
import "./AdminCourseOutlinePage.css";

export function AdminGlobalFaqsPage() {
  const { data: faqs, isLoading, isError, refetch } = useAdminFaqs();
  const createFaq = useCreateFaq();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAdd = async (event: FormEvent) => {
    try {
    event.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    await createFaq.mutateAsync({
      courseId: null,
      question: question.trim(),
      answer: answer.trim(),
      position: (faqs?.length ?? 0) + 1,
    });
    setQuestion("");
    setAnswer("");
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">SITE-WIDE CONTENT</span>
          <h1>Site FAQs</h1>
          <p className="text-muted">
            These appear on the public About/FAQ/Contact page — distinct from each course's own FAQ section.
          </p>
        </div>
      </div>

      {isLoading && <LoadingState label="Loading FAQs…" />}
      {isError && <ErrorState message="Couldn't load FAQs." onRetry={() => refetch()} />}

      {faqs?.map((faq) => (
        <FaqEditor key={faq.id} faq={faq} courseId={null} />
      ))}

      <form className="card outline-add-faq-card" onSubmit={handleAdd}>
        <div className="outline-add-module-card__label">
          <Icon name="plus" size={14} /> New FAQ
        </div>
        <label className="form-field">
          Question
          <input value={question} onChange={(e) => setQuestion(e.target.value)} />
        </label>
        <label className="form-field">
          Answer
          <RichTextEditor value={answer} onChange={setAnswer} placeholder="Write the answer…" minHeight={80} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={createFaq.isPending}>
          {createFaq.isPending ? "Adding…" : "Add FAQ"}
        </button>
      </form>
    </div>
  );
}
