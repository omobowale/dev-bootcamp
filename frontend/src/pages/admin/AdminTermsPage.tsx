import { useUnsavedChanges } from "../../hooks/useUnsavedChanges";
import { useEffect, useState } from "react";
import { useAdminTerms, useUpdateTerms } from "../../hooks/admin/useAdminSettings";
import { RichTextEditor } from "../../components/admin/RichTextEditor";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Icon } from "../../components/Icon";
import "./adminShared.css";
import "./AdminCourseOutlinePage.css";

export function AdminTermsPage() {
  const { data, isLoading, isError, refetch } = useAdminTerms();
  const updateTerms = useUpdateTerms();
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(false);

  useUnsavedChanges(!!data && content !== data.content && !updateTerms.isPending);
  useEffect(() => {
    if (data) setContent(data.content);
  }, [data]);

  const handleSave = async () => {
    try {
    setSaved(false);
    await updateTerms.mutateAsync(content);
    setSaved(true);
    } catch { /* Shared mutation feedback preserves the draft. */ }
  };

  if (isLoading) return <LoadingState label="Loading terms…" />;

  return (
    <div className="container admin-page">
      <div className="admin-page__header">
        <div>
          <span className="eyebrow">SITE-WIDE CONTENT</span>
          <h1>Terms &amp; Conditions</h1>
          <p className="text-muted">Shown publicly at /terms, and linked from the registration form's consent checkbox.</p>
        </div>
      </div>

      {isError && <ErrorState message="Couldn't load the terms." onRetry={() => refetch()} />}

      {!isError && (
        <div className="card admin-form-panel">
          <div className="outline-section-heading">
            <span className="outline-section-heading__icon">
              <Icon name="shield" size={17} />
            </span>
            <div>
              <h2>Terms content</h2>
              <p className="text-muted">Supports rich formatting — bold, italics, lists and headings via the toolbar.</p>
            </div>
          </div>

          <RichTextEditor value={content} onChange={setContent} minHeight={360} />

          <div className="admin-actions-row editor-save-bar" style={{ marginTop: 20 }}>
            <button type="button" className="btn btn-primary" onClick={handleSave} disabled={updateTerms.isPending}>
              {updateTerms.isPending ? "Saving…" : "Save changes"}
            </button>
            {saved && !updateTerms.isPending && <span className="text-muted" style={{ alignSelf: "center" }}>Saved.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
