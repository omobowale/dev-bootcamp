import { sanitizeRichText } from "../../utils/richText";
import { Select } from "../../components/Select";
import { Checkbox } from "../../components/Checkbox";
import { ErrorState } from "../../components/ErrorState";
import { CourseArtwork } from "../../components/CourseArtwork";
import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useAdminCourse, useCreateCourse, useUpdateCourse } from "../../hooks/admin/useAdminCourses";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { AdminCompletionCriteriaEditor } from "./AdminCompletionCriteriaEditor";
import { AdminCertificatesList } from "./AdminCertificatesList";
import { LoadingState } from "../../components/LoadingState";
import { Icon, type IconName } from "../../components/Icon";
import { ROUTES } from "../../constants/routes";
import type { AdminCourseInput } from "../../types/admin";
import type { WhatsIncludedItem } from "../../types/course";
import "./adminShared.css";
import "./AdminCourseOutlinePage.css";
import "./AdminCourseFormPage.css";

const EMPTY_FORM: AdminCourseInput = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  image: "",
  level: "",
  duration: "",
  mode: "Online",
  price: null,
  discountPrice: null,
  requirements: "",
  targetAudience: "",
  certificateAvailable: false,
  published: false,
  instructorName: "",
  instructorBio: "",
  instructorAvatarUrl: "",
  projects: "",
  whatsIncluded: [
    { title: "Live classes", description: "Interactive sessions with your instructor, several times a week." },
    { title: "Course curriculum", description: "A structured path through everything you need to learn, module by module." },
    { title: "Recorded sessions", description: "Missed a class? Catch up anytime with full session recordings." },
    { title: "Course materials", description: "Slides, code samples, and reference guides to keep for the long run." },
    { title: "Assignments", description: "Hands-on exercises after every module to lock in what you've learned." },
    { title: "Practical projects", description: "Real projects for your portfolio, not just toy examples." },
    { title: "Quizzes/assessments", description: "Quick checks to make sure concepts are actually sticking." },
    { title: "WhatsApp community", description: "A group chat with fellow students and instructors for support along the way." },
    { title: "Direct access to your instructor", description: "Ask questions and get feedback directly from your instructor during the cohort." },
    { title: "Final project", description: "A capstone project that ties everything together." },
    { title: "Certificate of completion", description: "A shareable certificate once you've finished the course." },
  ],
  aiSkillsDescription: "",
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function SectionHeading({ icon, title, description }: { icon: IconName; title: string; description: string }) {
  return (
    <div className="outline-section-heading">
      <span className="outline-section-heading__icon">
        <Icon name={icon} size={17} />
      </span>
      <div>
        <h2>{title}</h2>
        <p className="text-muted">{description}</p>
      </div>
    </div>
  );
}

function OptionCard({
  label,
  description,
  icon,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  icon: IconName;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`option-card${checked ? " option-card--active" : ""}`}>
      <span className="option-card__icon">
        <Icon name={icon} size={16} />
      </span>
      <span className="option-card__body">
        <strong>{label}</strong>
        <p>{description}</p>
      </span>
      <Checkbox checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function AdminCourseFormPage() {
  const params = useParams<{ id: string }>();
  const isEditing = Boolean(params.id);
  const courseId = params.id ? Number(params.id) : undefined;
  const navigate = useNavigate();

  const { data: existingCourse, isLoading, isError, refetch } = useAdminCourse(courseId);
  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse(courseId ?? -1);

  const [form, setForm] = useState<AdminCourseInput>(EMPTY_FORM);
  const savedNavigation = useRef(false);
  const [preview, setPreview] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = JSON.stringify(form) !== JSON.stringify(existingCourse ?? EMPTY_FORM) && !createMutation.isSuccess && !updateMutation.isSuccess;
  useUnsavedChanges(dirty, savedNavigation);
  useEffect(() => {
    if (existingCourse) {
      setForm(existingCourse);
      setSlugTouched(true);
    }
  }, [existingCourse]);

  const updateField = <K extends keyof AdminCourseInput>(key: K, value: AdminCourseInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateIncludedItem = (index: number, item: WhatsIncludedItem) => {
    setForm((prev) => ({ ...prev, whatsIncluded: prev.whatsIncluded.map((it, i) => (i === index ? item : it)) }));
  };
  const addIncludedItem = () => {
    setForm((prev) => ({ ...prev, whatsIncluded: [...prev.whatsIncluded, { title: "", description: "" }] }));
  };
  const removeIncludedItem = (index: number) => {
    setForm((prev) => ({ ...prev, whatsIncluded: prev.whatsIncluded.filter((_, i) => i !== index) }));
  };

  const handleTitleChange = (title: string) => {
    updateField("title", title);
    if (!slugTouched) {
      updateField("slug", slugify(title));
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.slug.trim()) {
      setError("Title and slug are required.");
      return;
    }

    const payload: AdminCourseInput = {
      ...form,
      whatsIncluded: form.whatsIncluded.filter((item) => item.title.trim() !== ""),
    };

    try {
      if (isEditing && courseId) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }
      savedNavigation.current = true;
      navigate(ROUTES.adminCourses);
    } catch {
      setError("Couldn't save this course. Check the slug isn't already used, and try again.");
    }
  };

  if (isEditing && isLoading) {
    return <LoadingState label="Loading course…" />;
  }

  if (isEditing && (isError || !existingCourse)) return <ErrorState message="This course couldn’t be loaded. It may no longer exist." onRetry={() => refetch()} />;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">COURSE CATALOG</span>
          <h1>{isEditing ? "Edit course" : "New course"}</h1>
          <p className="text-muted">Everything here shapes the public course page students see.</p>
        </div>
        <Link to={ROUTES.adminCourses} className="btn btn-secondary">
          <Icon name="arrow" size={15} style={{ transform: "rotate(180deg)" }} /> Back to courses
        </Link>
      </div>

      <form className="card admin-form-panel" onSubmit={handleSubmit}>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <section className="course-form-section">
          <SectionHeading icon="book" title="Basics" description="Title, pricing and how this course is delivered." />

          <div className="admin-form-grid">
            <div className="form-field form-field--full">
              <label htmlFor="title">Title</label>
              <input id="title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} required />
            </div>

            <div className="form-field form-field--full">
              <label htmlFor="slug">Slug</label>
              <input
                id="slug"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  updateField("slug", e.target.value);
                }}
                required
              />
            </div>

            <div className="form-field form-field--full">
              <label htmlFor="shortDescription">Short description</label>
              <input
                id="shortDescription"
                value={form.shortDescription ?? ""}
                onChange={(e) => updateField("shortDescription", e.target.value)}
                placeholder="One line shown on course cards and listings"
              />
            </div>

            <div className="form-field">
              <label htmlFor="level">Level</label>
              <Select id="level" value={form.level ?? ""} onChange={e => updateField("level", e.target.value)}><option value="">Choose a level</option>{["Beginner", "Intermediate", "Advanced"].map(item => <option key={item}>{item}</option>)}</Select>
            </div>

            <div className="form-field">
              <label htmlFor="duration">Duration</label>
              <input
                id="duration"
                value={form.duration ?? ""}
                onChange={(e) => updateField("duration", e.target.value)}
                placeholder="12 weeks"
              />
            </div>

            <div className="form-field">
              <label htmlFor="price">Regular price (NGN)</label>
              <input
                id="price"
                type="number"
                min="0"
                value={form.price ?? ""}
                onChange={(e) => updateField("price", e.target.value === "" ? null : Number(e.target.value))}
              />
            </div>

            <div className="form-field">
              <label htmlFor="discountPrice">Discount price (optional)</label>
              <input
                id="discountPrice"
                type="number"
                min="0"
                value={form.discountPrice ?? ""}
                onChange={(e) => updateField("discountPrice", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="Leave blank for no discount"
              />
              <p className="text-muted course-form-hint">Shown struck-through against the regular price when lower.</p>
            </div>

            <div className="form-field form-field--full">
              <div className="course-form-online-note">
                <Icon name="globe" size={15} /> All DevTraining courses are delivered 100% online.
              </div>
            </div>

            <div className="form-field form-field--full course-form-image-row">
              <div className="form-field">
                <label htmlFor="image">Cover image URL</label>
                <input type="url" id="image" value={form.image ?? ""} onChange={(e) => updateField("image", e.target.value)} placeholder="https://…" />
              </div>
              <div className="course-form-image-preview" style={form.image ? { backgroundImage: `url(${form.image})` } : undefined}>
                {!form.image && <Icon name="grid" size={20} />}
              </div>
            </div>
          </div>
        </section>

        <section className="course-form-section">
          <SectionHeading icon="edit" title="Course content" description="These fields support rich formatting — bold, italics and lists." />

          <label className="form-field">
            Full description
            <RichTextEditor
              value={form.description ?? ""}
              onChange={(html) => updateField("description", html)}
              placeholder="What is this course about?"
              minHeight={130}
            />
          </label>

          <label className="form-field">
            Requirements
            <RichTextEditor
              value={form.requirements ?? ""}
              onChange={(html) => updateField("requirements", html)}
              placeholder="What should students already know or have ready?"
              minHeight={90}
            />
          </label>

          <label className="form-field">
            Who this course is for
            <RichTextEditor
              value={form.targetAudience ?? ""}
              onChange={(html) => updateField("targetAudience", html)}
              placeholder="Describe the ideal student"
              minHeight={90}
            />
          </label>

          <div className="form-field">
            <label htmlFor="projects">Projects (one per line)</label>
            <p className="text-muted course-form-hint">Plain text only — each line becomes one project on the public page.</p>
            <textarea
              id="projects"
              rows={4}
              value={form.projects ?? ""}
              onChange={(e) => updateField("projects", e.target.value)}
            />
          </div>
        </section>

        <section className="course-form-section">
          <SectionHeading icon="check" title="What's included" description="A concrete checklist of what students get — each item can explain why it matters." />

          {form.whatsIncluded.map((item, index) => (
            <div className="content-entry" key={index}>
              <div className="admin-form-grid">
                <label className="form-field form-field--full">
                  Item title
                  <input
                    required
                    value={item.title}
                    onChange={(e) => updateIncludedItem(index, { ...item, title: e.target.value })}
                    placeholder="e.g. Live classes"
                  />
                </label>
                <label className="form-field form-field--full">
                  Description (optional)
                  <textarea
                    rows={2}
                    value={item.description ?? ""}
                    onChange={(e) => updateIncludedItem(index, { ...item, description: e.target.value })}
                    placeholder="Why this matters to students"
                  />
                </label>
              </div>
              <div className="content-entry__actions">
                <button type="button" className="btn btn-secondary" onClick={() => removeIncludedItem(index)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-secondary" onClick={addIncludedItem}>
            <Icon name="plus" size={14} /> Add item
          </button>
        </section>

        <section className="course-form-section">
          <SectionHeading icon="users" title="Instructor" description="Who students will be learning from." />

          <div className="admin-form-grid">
            <div className="form-field">
              <label htmlFor="instructorName">Instructor name</label>
              <input
                id="instructorName"
                value={form.instructorName ?? ""}
                onChange={(e) => updateField("instructorName", e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="instructorAvatarUrl">Instructor avatar URL</label>
              <input
                id="instructorAvatarUrl"
                value={form.instructorAvatarUrl ?? ""}
                onChange={(e) => updateField("instructorAvatarUrl", e.target.value)}
              />
            </div>
          </div>

          <label className="form-field">
            Instructor bio
            <RichTextEditor
              value={form.instructorBio ?? ""}
              onChange={(html) => updateField("instructorBio", html)}
              placeholder="A short bio shown on the course page"
              minHeight={90}
            />
          </label>
        </section>

        <section className="course-form-section">
          <SectionHeading icon="shield" title="Publishing & options" description="Controls how this course appears to the public." />

          <div className="option-card-grid">
            <OptionCard
              icon="check"
              label="Certificate available"
              description="Students receive a certificate on completion."
              checked={form.certificateAvailable}
              onChange={(checked) => updateField("certificateAvailable", checked)}
            />
            <OptionCard
              icon="globe"
              label="Published"
              description="Visible to the public on the course catalog."
              checked={form.published}
              onChange={(checked) => updateField("published", checked)}
            />
          </div>

          <div className="form-field" style={{ marginTop: 18 }}>
            <label htmlFor="aiSkillsDescription">AI skills included (optional)</label>
            <p className="text-muted course-form-hint">
              What AI skill does this course specifically teach? Shown as a badge — leave blank if not applicable.
              e.g. "AI-assisted coding" or "AI-assisted data analysis".
            </p>
            <input
              id="aiSkillsDescription"
              value={form.aiSkillsDescription ?? ""}
              onChange={(e) => updateField("aiSkillsDescription", e.target.value)}
              placeholder="e.g. AI-assisted coding"
              maxLength={500}
            />
          </div>
        </section>

        <div className="editor-save-bar"><span>{dirty ? "Unsaved changes" : "Course details"}</span><div className="admin-actions-row"><button type="button" className="btn btn-secondary" onClick={() => setPreview(!preview)}>{preview ? "Close preview" : "Preview"}</button>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save course"}
          </button>
          <Link to={ROUTES.adminCourses} className="btn btn-secondary">
            Cancel
          </Link>
        </div></div>
        {preview && <section className="course-draft-preview"><span className="eyebrow">DRAFT PREVIEW</span><CourseArtwork image={form.image} title={form.title || "Your course"} /><h2>{form.title || "Your course title"}</h2><p>{form.shortDescription}</p><div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(form.description || "") }} /><strong>{form.instructorName}</strong><div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(form.instructorBio || "") }} /></section>}
      </form>

      {isEditing && courseId && (
        <div className="card admin-form-panel">
          <SectionHeading
            icon="check"
            title="Completion criteria"
            description="What counts as finishing this course. Saved independently of the form above."
          />
          <AdminCompletionCriteriaEditor courseId={courseId} />
        </div>
      )}

      {isEditing && courseId && (
        <div className="card admin-form-panel">
          <SectionHeading
            icon="shield"
            title="Certificates"
            description="Issued automatically once a student meets the completion criteria above."
          />
          <AdminCertificatesList courseId={courseId} />
        </div>
      )}
    </div>
  );
}
