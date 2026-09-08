import { useState, type FormEvent } from "react";
import {
  useAdminMaterials,
  useDeleteMaterial,
  useReorderMaterials,
  useUploadMaterial,
} from "../../hooks/admin/useAdminMaterials";
import { LoadingState } from "../../components/LoadingState";
import { ErrorState } from "../../components/ErrorState";
import { Icon } from "../../components/Icon";
import { useConfirm } from "../../context/ConfirmDialogContext";
import type { AdminCourseMaterial } from "../../types/admin";

function MaterialRow({
  material,
  isFirst,
  isLast,
  onMove,
  onDelete,
}: {
  material: AdminCourseMaterial;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: "up" | "down") => void;
  onDelete: () => void;
}) {
  return (
    <li className="outline-item">
      <div>
        <a href={material.fileUrl} target="_blank" rel="noreferrer" className="text-link">
          <strong>{material.title}</strong>
        </a>
        {material.description && (
          <p className="text-muted" style={{ margin: "2px 0 0" }}>
            {material.description}
          </p>
        )}
        <p className="text-muted" style={{ margin: "2px 0 0", fontSize: 12 }}>
          {material.fileName}
        </p>
      </div>
      <div className="admin-actions-row">
        <button
          type="button"
          className="btn btn-secondary outline-btn"
          aria-label={`Move ${material.title} up`}
          disabled={isFirst}
          onClick={() => onMove("up")}
        >
          ↑
        </button>
        <button
          type="button"
          className="btn btn-secondary outline-btn"
          aria-label={`Move ${material.title} down`}
          disabled={isLast}
          onClick={() => onMove("down")}
        >
          ↓
        </button>
        <button type="button" className="btn btn-secondary outline-btn" aria-label={`Delete ${material.title}`} onClick={onDelete}>
          Delete
        </button>
      </div>
    </li>
  );
}

export function AdminMaterialsEditor({ classSessionId }: { classSessionId: number }) {
  const { data: materials, isLoading, isError, refetch } = useAdminMaterials(classSessionId);
  const upload = useUploadMaterial(classSessionId);
  const deleteMaterial = useDeleteMaterial(classSessionId);
  const reorder = useReorderMaterials(classSessionId);
  const confirm = useConfirm();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);

  if (isLoading) return <LoadingState label="Loading materials…" />;
  if (isError) return <ErrorState message="Could not load materials." onRetry={() => refetch()} />;

  const handleUpload = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !file) return;
    upload.mutate(
      { title: title.trim(), description: description.trim(), file },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setFile(null);
        },
      },
    );
  };

  const handleMove = (materialId: number, direction: "up" | "down") => {
    if (!materials) return;
    const ids = materials.map((m) => m.id);
    const index = ids.indexOf(materialId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= ids.length) return;
    [ids[index], ids[swapWith]] = [ids[swapWith], ids[index]];
    reorder.mutate(ids);
  };

  const handleDelete = async (material: AdminCourseMaterial) => {
    const ok = await confirm({
      title: `Delete "${material.title}"?`,
      description: "This can't be undone.",
      confirmLabel: "Delete material",
      danger: true,
      icon: "trash",
    });
    if (ok) deleteMaterial.mutate(material.id);
  };

  return (
    <div>
      {materials && materials.length > 0 ? (
        <ul className="outline-list" style={{ marginBottom: 16 }}>
          {materials.map((material, index) => (
            <MaterialRow
              key={material.id}
              material={material}
              isFirst={index === 0}
              isLast={index === materials.length - 1}
              onMove={(direction) => handleMove(material.id, direction)}
              onDelete={() => handleDelete(material)}
            />
          ))}
        </ul>
      ) : (
        <p className="text-muted" style={{ marginBottom: 16 }}>
          No materials uploaded yet.
        </p>
      )}

      <form onSubmit={handleUpload} className="admin-form-grid">
        <label className="form-field form-field--full">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Slide deck — React Hooks" />
        </label>
        <label className="form-field form-field--full">
          Description (optional)
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this resource for?" />
        </label>
        <label className="form-field form-field--full">
          File
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <button type="submit" className="btn btn-primary" disabled={upload.isPending || !title.trim() || !file}>
          <Icon name="plus" size={14} /> {upload.isPending ? "Uploading…" : "Add material"}
        </button>
      </form>
    </div>
  );
}
