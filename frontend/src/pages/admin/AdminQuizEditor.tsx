import { useEffect, useId, useState } from "react";
import { Link } from "react-router-dom";
import {
  useAdminQuiz,
  useCreateQuiz,
  useCreateQuizQuestion,
  useDeleteQuizQuestion,
  useReorderQuizQuestions,
  useUpdateQuizQuestion,
  useUpdateQuizSettings,
} from "../../hooks/admin/useAdminQuiz";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { LoadingState } from "../../components/LoadingState";
import { Icon } from "../../components/Icon";
import { adminQuizAttemptsPath } from "../../constants/routes";
import type { AdminQuizQuestion, AdminQuizQuestionInput } from "../../types/admin";

const EMPTY_OPTIONS = [
  { text: "", correct: true },
  { text: "", correct: false },
  { text: "", correct: false },
  { text: "", correct: false },
];

function emptyQuestionForm(position: number): AdminQuizQuestionInput {
  return { text: "", points: 1, explanation: "", position, options: EMPTY_OPTIONS.map((o) => ({ ...o })) };
}

function QuestionOptionsEditor({
  options,
  onChange,
}: {
  options: { text: string; correct: boolean }[];
  onChange: (options: { text: string; correct: boolean }[]) => void;
}) {
  const id = useId();
  const groupName = `correct-${id}`;
  return (
    <div className="quiz-options-editor">
      {options.map((option, index) => (
        <div className="quiz-options-editor__row" key={index}>
          <input
            type="radio"
            name={groupName}
            checked={option.correct}
            onChange={() => onChange(options.map((o, i) => ({ ...o, correct: i === index })))}
            aria-label={`Mark option ${index + 1} as correct`}
          />
          <input
            value={option.text}
            onChange={(e) => onChange(options.map((o, i) => (i === index ? { ...o, text: e.target.value } : o)))}
            placeholder={`Option ${index + 1}`}
          />
        </div>
      ))}
    </div>
  );
}

function QuestionRow({
  question,
  onSave,
  onDelete,
  onMove,
  isFirst,
  isLast,
  saving,
}: {
  question: AdminQuizQuestion;
  onSave: (input: AdminQuizQuestionInput) => void;
  onDelete: () => void;
  onMove: (direction: "up" | "down") => void;
  isFirst: boolean;
  isLast: boolean;
  saving: boolean;
}) {
  const [form, setForm] = useState<AdminQuizQuestionInput>({
    text: question.text,
    points: question.points,
    explanation: question.explanation ?? "",
    position: question.position,
    options: question.options.map((o) => ({ ...o })),
  });
  const dirty = JSON.stringify(form) !== JSON.stringify({
    text: question.text,
    points: question.points,
    explanation: question.explanation ?? "",
    position: question.position,
    options: question.options,
  });

  return (
    <div className="card content-entry quiz-question-card">
      <div className="admin-form-grid">
        <label className="form-field form-field--full">
          Question
          <textarea
            rows={2}
            value={form.text}
            onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
          />
        </label>
        <label className="form-field">
          Points
          <input
            type="number"
            min={1}
            value={form.points}
            onChange={(e) => setForm((prev) => ({ ...prev, points: Number(e.target.value) }))}
          />
        </label>
        <label className="form-field form-field--full">
          Explanation (optional, shown after submission)
          <textarea
            rows={2}
            value={form.explanation ?? ""}
            onChange={(e) => setForm((prev) => ({ ...prev, explanation: e.target.value }))}
          />
        </label>
        <div className="form-field form-field--full">
          Options — select the correct one
          <QuestionOptionsEditor options={form.options} onChange={(options) => setForm((prev) => ({ ...prev, options }))} />
        </div>
      </div>
      <div className="content-entry__actions">
        <button type="button" className="btn btn-primary" disabled={!dirty || saving} onClick={() => onSave(form)}>
          {saving ? "Saving…" : "Save question"}
        </button>
        <button type="button" className="btn btn-secondary outline-btn" disabled={isFirst} onClick={() => onMove("up")}>
          ↑
        </button>
        <button type="button" className="btn btn-secondary outline-btn" disabled={isLast} onClick={() => onMove("down")}>
          ↓
        </button>
        <button type="button" className="btn btn-secondary" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}

export function AdminQuizEditor({ classSessionId }: { classSessionId: number }) {
  const { data: quiz, isLoading } = useAdminQuiz(classSessionId);
  const createQuiz = useCreateQuiz(classSessionId);
  const updateSettings = useUpdateQuizSettings(classSessionId);
  const createQuestion = useCreateQuizQuestion(classSessionId);
  const updateQuestion = useUpdateQuizQuestion(classSessionId);
  const deleteQuestion = useDeleteQuizQuestion(classSessionId);
  const reorderQuestions = useReorderQuizQuestions(classSessionId);
  const confirm = useConfirm();

  const [passingPercentage, setPassingPercentage] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState<string>("");
  const [newQuestion, setNewQuestion] = useState<AdminQuizQuestionInput>(emptyQuestionForm(1));

  useEffect(() => {
    if (quiz) {
      setPassingPercentage(quiz.passingPercentage);
      setMaxAttempts(quiz.maxAttempts !== null ? String(quiz.maxAttempts) : "");
      setNewQuestion(emptyQuestionForm(quiz.questions.length + 1));
    }
  }, [quiz]);

  if (isLoading) return <LoadingState label="Loading quiz…" />;

  if (!quiz) {
    return (
      <button type="button" className="btn btn-secondary" onClick={() => createQuiz.mutate()} disabled={createQuiz.isPending}>
        <Icon name="plus" size={14} /> {createQuiz.isPending ? "Setting up…" : "Set up quiz"}
      </button>
    );
  }

  const moveQuestion = (questionId: number, direction: "up" | "down") => {
    const ids = quiz.questions.map((q) => q.id);
    const index = ids.indexOf(questionId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= ids.length) return;
    [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
    reorderQuestions.mutate({ quizId: quiz.id, orderedQuestionIds: ids });
  };

  const handleDeleteQuestion = async (question: AdminQuizQuestion) => {
    const ok = await confirm({
      title: "Delete this question?",
      description: "Any past student answers to it will be removed too. This can't be undone.",
      confirmLabel: "Delete question",
      danger: true,
      icon: "trash",
    });
    if (ok) deleteQuestion.mutate(question.id);
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.text.trim() || newQuestion.options.some((o) => !o.text.trim())) return;
    try {
      await createQuestion.mutateAsync({ quizId: quiz.id, input: newQuestion });
      setNewQuestion(emptyQuestionForm(quiz.questions.length + 2));
    } catch {
      /* Shared mutation feedback preserves the draft. */
    }
  };

  return (
    <div>
      <div className="admin-form-grid" style={{ marginBottom: 20 }}>
        <label className="form-field">
          Passing percentage
          <input
            type="number"
            min={1}
            max={100}
            value={passingPercentage}
            onChange={(e) => setPassingPercentage(Number(e.target.value))}
          />
        </label>
        <label className="form-field">
          Max attempts (blank = unlimited)
          <input
            type="number"
            min={1}
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(e.target.value)}
            placeholder="Unlimited"
          />
        </label>
        <div className="form-field" style={{ justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={updateSettings.isPending}
            onClick={() =>
              updateSettings.mutate({
                quizId: quiz.id,
                input: { passingPercentage, maxAttempts: maxAttempts.trim() === "" ? null : Number(maxAttempts) },
              })
            }
          >
            {updateSettings.isPending ? "Saving…" : "Save quiz settings"}
          </button>
        </div>
      </div>

      <Link to={adminQuizAttemptsPath(quiz.id)} className="text-link" style={{ marginBottom: 16, display: "inline-flex" }}>
        View attempts <Icon name="arrow" size={13} />
      </Link>

      {quiz.questions.map((question, index) => (
        <QuestionRow
          key={question.id}
          question={question}
          isFirst={index === 0}
          isLast={index === quiz.questions.length - 1}
          saving={updateQuestion.isPending}
          onMove={(direction) => moveQuestion(question.id, direction)}
          onDelete={() => handleDeleteQuestion(question)}
          onSave={(input) => updateQuestion.mutate({ id: question.id, input })}
        />
      ))}

      <div className="card content-entry quiz-question-card">
        <div className="admin-form-grid">
          <label className="form-field form-field--full">
            New question
            <textarea
              rows={2}
              value={newQuestion.text}
              onChange={(e) => setNewQuestion((prev) => ({ ...prev, text: e.target.value }))}
              placeholder="e.g. What does useState return?"
            />
          </label>
          <label className="form-field">
            Points
            <input
              type="number"
              min={1}
              value={newQuestion.points}
              onChange={(e) => setNewQuestion((prev) => ({ ...prev, points: Number(e.target.value) }))}
            />
          </label>
          <label className="form-field form-field--full">
            Explanation (optional)
            <textarea
              rows={2}
              value={newQuestion.explanation ?? ""}
              onChange={(e) => setNewQuestion((prev) => ({ ...prev, explanation: e.target.value }))}
            />
          </label>
          <div className="form-field form-field--full">
            Options — select the correct one
            <QuestionOptionsEditor
              options={newQuestion.options}
              onChange={(options) => setNewQuestion((prev) => ({ ...prev, options }))}
            />
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleAddQuestion} disabled={createQuestion.isPending}>
          <Icon name="plus" size={14} /> {createQuestion.isPending ? "Adding…" : "Add question"}
        </button>
      </div>
    </div>
  );
}
