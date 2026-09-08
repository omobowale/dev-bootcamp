import { sanitizeRichText } from "../../utils/richText";
import { ErrorState } from "../../components/ErrorState";
import { useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { useAdminCourse } from "../../hooks/admin/useAdminCourses";
import {
  useAdminModules,
  useCreateModule,
  useCreateTopic,
  useDeleteClassSession,
  useDeleteModule,
  useDeleteTopic,
  useReorderClassSessions,
  useReorderModules,
  useReorderTopics,
  useUpdateModule,
  useUpdateTopic,
} from "../../hooks/admin/useAdminModules";
import { useAdminFaqs, useCreateFaq } from "../../hooks/admin/useAdminFaqs";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { LoadingState } from "../../components/LoadingState";
import { FaqEditor } from "../../components/admin/FaqEditor";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { Icon } from "../../components/Icon";
import { ROUTES, adminClassSessionEditPath, adminClassSessionNewPath } from "../../constants/routes";
import type { AdminClassSession, AdminModule, AdminTopic } from "../../types/admin";
import "./adminShared.css";
import "./AdminCourseOutlinePage.css";

function InlineTitle({ title, saving, onSave }: { title: string; saving: boolean; onSave: (title: string, done: () => void) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  if (!editing) return <div className="outline-inline-edit"><strong>{title}</strong><button type="button" className="text-link" aria-label={`Rename ${title}`} onClick={() => { setDraft(title); setEditing(true); }}>Rename</button></div>;
  return <form className="outline-inline-edit" onSubmit={event => { event.preventDefault(); if (draft.trim()) onSave(draft.trim(), () => setEditing(false)); }}><input autoFocus aria-label={`New title for ${title}`} value={draft} onChange={event => setDraft(event.target.value)} required /><button className="btn btn-primary" disabled={saving || !draft.trim()}>{saving ? 'Saving…' : 'Save'}</button><button type="button" className="btn btn-secondary" disabled={saving} onClick={() => setEditing(false)}>Cancel</button></form>;
}
function TopicRow({ topic, courseId, isFirst, isLast, onMove, onDelete }: { topic: AdminTopic; courseId: number; isFirst: boolean; isLast: boolean; onMove: (direction: 'up' | 'down') => void; onDelete: () => void }) {
  const update = useUpdateTopic(courseId);
  return <li className="outline-item"><InlineTitle title={topic.title} saving={update.isPending} onSave={(title, done) => update.mutate({ topicId: topic.id, input: { title, position: topic.position } }, { onSuccess: done })} /><div className="admin-actions-row"><button type="button" className="btn btn-secondary outline-btn" aria-label={`Move ${topic.title} up`} disabled={isFirst} onClick={() => onMove('up')}>↑</button><button type="button" className="btn btn-secondary outline-btn" aria-label={`Move ${topic.title} down`} disabled={isLast} onClick={() => onMove('down')}>↓</button><button type="button" className="btn btn-secondary outline-btn" aria-label={`Delete ${topic.title}`} onClick={onDelete}>Delete</button></div></li>;
}

function ClassSessionRow({
  session,
  courseId,
  isFirst,
  isLast,
  onMove,
  onDelete,
}: {
  session: AdminClassSession;
  courseId: number;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}) {
  return (
    <li className="outline-item">
      <Link to={adminClassSessionEditPath(courseId, session.moduleId, session.id)} className="text-link">
        <strong>{session.title}</strong>
      </Link>
      <div className="admin-actions-row">
        <button
          type="button"
          className="btn btn-secondary outline-btn"
          aria-label={`Move ${session.title} up`}
          disabled={isFirst}
          onClick={() => onMove("up")}
        >
          ↑
        </button>
        <button
          type="button"
          className="btn btn-secondary outline-btn"
          aria-label={`Move ${session.title} down`}
          disabled={isLast}
          onClick={() => onMove("down")}
        >
          ↓
        </button>
        <button
          type="button"
          className="btn btn-secondary outline-btn"
          aria-label={`Delete ${session.title}`}
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function ModuleCard({
  module,
  courseId,
  position,
  isFirst,
  isLast,
  onMoveModule,
}: {
  module: AdminModule;
  courseId: number;
  position: number;
  isFirst: boolean;
  isLast: boolean;
  onMoveModule: (direction: "up" | "down") => void;
}) {
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description ?? "");
  const updateModule = useUpdateModule(courseId);
  const deleteModule = useDeleteModule(courseId);
  const reorderTopics = useReorderTopics(courseId);
  const createTopic = useCreateTopic(courseId);
  const deleteTopic = useDeleteTopic(courseId);
  const reorderClassSessions = useReorderClassSessions(courseId);
  const deleteClassSession = useDeleteClassSession(courseId);
  const confirm = useConfirm();

  const moveClassSession = (sessionId: number, direction: "up" | "down") => {
    const ids = module.classSessions.map((s) => s.id);
    const index = ids.indexOf(sessionId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= ids.length) return;
    [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
    reorderClassSessions.mutate({ moduleId: module.id, orderedClassSessionIds: ids });
  };

  const handleDeleteClassSession = async (session: AdminClassSession) => {
    try {
      const ok = await confirm({
        title: `Delete class "${session.title}"?`,
        description: "This also deletes its lesson sections. This can't be undone.",
        confirmLabel: "Delete class",
        danger: true,
        icon: "trash",
      });
      if (ok) deleteClassSession.mutate(session.id);
    } catch {
      /* Shared mutation feedback preserves the draft. */
    }
  };

  const moveTopic = (topicId: number, direction: "up" | "down") => {
    const ids = module.topics.map((t) => t.id);
    const index = ids.indexOf(topicId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= ids.length) return;
    [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
    reorderTopics.mutate({ moduleId: module.id, orderedTopicIds: ids });
  };

  const handleAddTopic = async (event: FormEvent) => {
    try {
    event.preventDefault();
    if (!newTopicTitle.trim()) return;
    await createTopic.mutateAsync({ moduleId: module.id, input: { title: newTopicTitle.trim(), position: module.topics.length + 1 } });
    setNewTopicTitle("");
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  const handleSaveModule = async () => {
    try {
    if (!title.trim()) return;
    await updateModule.mutateAsync({ moduleId: module.id, input: { title: title.trim(), description, position: module.position } });
    setEditing(false);
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  const handleDeleteModule = async () => {
    try {
    const ok = await confirm({
      title: `Delete module "${module.title}"?`,
      description: `This also deletes its ${module.topics.length} topic${module.topics.length === 1 ? "" : "s"}. This can't be undone.`,
      confirmLabel: "Delete module",
      danger: true,
      icon: "trash",
    });
    if (ok) deleteModule.mutate(module.id);
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  const handleDeleteTopic = async (topic: AdminTopic) => {
    try {
    const ok = await confirm({
      title: `Delete topic "${topic.title}"?`,
      confirmLabel: "Delete topic",
      danger: true,
      icon: "trash",
    });
    if (ok) deleteTopic.mutate(topic.id);
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  return (
    <div className="card outline-module">
      <div className="outline-module__header">
        <span className="outline-module__position">{position}</span>
        <div className="outline-module__title">
          <strong>{module.title}</strong>
          {module.description && <p className="text-muted rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(module.description) }} />}
        </div>
        <div className="outline-module__actions">
          <button type="button" className="icon-btn" title="Edit module" aria-label="Edit module" onClick={() => { setTitle(module.title); setDescription(module.description ?? ""); setEditing(true); }}>
            <Icon name="edit" size={14} />
          </button>
          <button type="button" className="icon-btn" title="Move up" aria-label="Move module up" disabled={isFirst} onClick={() => onMoveModule("up")}>
            <Icon name="arrow" size={14} style={{ transform: "rotate(-90deg)" }} />
          </button>
          <button type="button" className="icon-btn" title="Move down" aria-label="Move module down" disabled={isLast} onClick={() => onMoveModule("down")}>
            <Icon name="arrow" size={14} style={{ transform: "rotate(90deg)" }} />
          </button>
          <button type="button" className="icon-btn icon-btn--danger" title="Delete module" aria-label="Delete module" onClick={handleDeleteModule}>
            <Icon name="trash" size={14} />
          </button>
        </div>
      </div>

      <div className="outline-module__body">
        {editing && (
          <div style={{ marginBottom: 18 }}>
            <label className="form-field">
              Module title
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="form-field">
              Description
              <RichTextEditor value={description} onChange={setDescription} placeholder="What does this module cover?" minHeight={80} />
            </label>
            <div className="admin-actions-row">
              <button type="button" className="btn btn-primary" onClick={handleSaveModule} disabled={updateModule.isPending}>
                {updateModule.isPending ? "Saving…" : "Save module"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        <ul className="outline-list">
          {module.topics.map((topic, index) => (
            <TopicRow
              key={topic.id}
              topic={topic}
              courseId={courseId}
              isFirst={index === 0}
              isLast={index === module.topics.length - 1}
              onMove={(direction) => moveTopic(topic.id, direction)}
              onDelete={() => handleDeleteTopic(topic)}
            />
          ))}
        </ul>

        <form className="outline-add-form" onSubmit={handleAddTopic}>
          <input
            value={newTopicTitle}
            onChange={(e) => setNewTopicTitle(e.target.value)}
            aria-label={`New topic for ${module.title}`} placeholder="New topic title"
          />
          <button type="submit" className="btn btn-secondary">
            <Icon name="plus" size={14} /> Add topic
          </button>
        </form>

        <div className="outline-module__subheading">
          <strong>Classes</strong>
          <span className="text-muted">Gated lesson content for enrolled students only.</span>
        </div>

        <ul className="outline-list">
          {module.classSessions.map((session, index) => (
            <ClassSessionRow
              key={session.id}
              session={session}
              courseId={courseId}
              isFirst={index === 0}
              isLast={index === module.classSessions.length - 1}
              onMove={(direction) => moveClassSession(session.id, direction)}
              onDelete={() => handleDeleteClassSession(session)}
            />
          ))}
        </ul>

        <Link to={adminClassSessionNewPath(courseId, module.id)} className="btn btn-secondary">
          <Icon name="plus" size={14} /> Add class
        </Link>
      </div>
    </div>
  );
}

export function AdminCourseOutlinePage() {
  const { id } = useParams<{ id: string }>();
  const courseId = Number(id);

  const { data: course } = useAdminCourse(courseId);
  const { data: modules, isLoading: modulesLoading, isError: modulesError, refetch: refetchModules } = useAdminModules(courseId);
  const { data: faqs, isLoading: faqsLoading, isError: faqsError, refetch: refetchFaqs } = useAdminFaqs(courseId);

  const createModule = useCreateModule(courseId);
  const reorderModules = useReorderModules(courseId);
  const createFaq = useCreateFaq(courseId);

  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDescription, setNewModuleDescription] = useState("");
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  const moveModule = (moduleId: number, direction: "up" | "down") => {
    if (!modules) return;
    const ids = modules.map((m) => m.id);
    const index = ids.indexOf(moduleId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= ids.length) return;
    [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
    reorderModules.mutate(ids);
  };

  const handleAddModule = async (event: FormEvent) => {
    try {
    event.preventDefault();
    if (!newModuleTitle.trim()) return;
    await createModule.mutateAsync({
      title: newModuleTitle.trim(),
      description: newModuleDescription || null,
      position: (modules?.length ?? 0) + 1,
    });
    setNewModuleTitle("");
    setNewModuleDescription("");
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  const handleAddFaq = async (event: FormEvent) => {
    try {
    event.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    await createFaq.mutateAsync({
      courseId,
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      position: (faqs?.length ?? 0) + 1,
    });
    setNewFaqQuestion("");
    setNewFaqAnswer("");
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">COURSE CONTENT</span>
          <h1>{course?.title ?? "Course"}</h1>
          <p className="text-muted">Manage modules, topics and course-specific FAQs.</p>
        </div>
        <Link to={ROUTES.adminCourses} className="btn btn-secondary">
          <Icon name="arrow" size={15} style={{ transform: "rotate(180deg)" }} /> Back to courses
        </Link>
      </div>

      <section style={{ marginBottom: 48 }}>
        <div className="outline-section-heading">
          <span className="outline-section-heading__icon">
            <Icon name="layers" size={17} />
          </span>
          <div>
            <h2>Modules &amp; topics</h2>
            <p className="text-muted">The course outline shown on the public course page.</p>
          </div>
        </div>

        {modulesError && <ErrorState message="Couldn’t load the outline." onRetry={() => refetchModules()} />}
        {modulesLoading && <LoadingState label="Loading modules…" />}
        {modules?.map((module, index) => (
          <ModuleCard
            key={module.id}
            module={module}
            courseId={courseId}
            position={index + 1}
            isFirst={index === 0}
            isLast={index === modules.length - 1}
            onMoveModule={(direction) => moveModule(module.id, direction)}
          />
        ))}

        <form className="card outline-add-module-card" onSubmit={handleAddModule}>
          <div className="outline-add-module-card__label">
            <Icon name="plus" size={14} /> New module
          </div>
          <label className="form-field">
            Title
            <input value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} placeholder="e.g. Frontend Foundations" />
          </label>
          <label className="form-field">
            Description (optional)
            <RichTextEditor value={newModuleDescription} onChange={setNewModuleDescription} placeholder="What will students learn in this module?" minHeight={70} />
          </label>
          <button type="submit" className="btn btn-primary">
            <Icon name="plus" size={14} /> Add module
          </button>
        </form>
      </section>

      <section>
        <div className="outline-section-heading">
          <span className="outline-section-heading__icon">
            <Icon name="mail" size={16} />
          </span>
          <div>
            <h2>Course FAQs</h2>
            <p className="text-muted">Shown on this course's detail page, separate from the site-wide FAQs.</p>
          </div>
        </div>

        {faqsError && <ErrorState message="Couldn’t load course FAQs." onRetry={() => refetchFaqs()} />}
        {faqsLoading && <LoadingState label="Loading FAQs…" />}
        {faqs?.map((faq) => (
          <FaqEditor key={faq.id} faq={faq} courseId={courseId} />
        ))}

        <form className="card outline-add-faq-card" onSubmit={handleAddFaq}>
          <div className="outline-add-module-card__label">
            <Icon name="plus" size={14} /> New FAQ
          </div>
          <label className="form-field">
            Question
            <input value={newFaqQuestion} onChange={(e) => setNewFaqQuestion(e.target.value)} />
          </label>
          <label className="form-field">
            Answer
            <RichTextEditor value={newFaqAnswer} onChange={setNewFaqAnswer} placeholder="Write the answer…" minHeight={80} />
          </label>
          <button type="submit" className="btn btn-primary">
            <Icon name="plus" size={14} /> Add FAQ
          </button>
        </form>
      </section>
    </div>
  );
}
