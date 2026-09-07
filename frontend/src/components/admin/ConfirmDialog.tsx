import type { ReactNode } from "react";
import { Modal } from "../Modal";
import { Icon, type IconName } from "../Icon";
import "./ConfirmDialog.css";

export interface ConfirmOptions {
  title: string;
  description?: string;
  content?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the icon and confirm button as a destructive action. */
  danger?: boolean;
  icon?: IconName;
}

export function ConfirmDialog({
  title,
  description,
  content,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmOptions & { onConfirm: () => void; onCancel: () => void }) {
  const resolvedIcon: IconName = icon ?? (danger ? "alertTriangle" : "check");

  return (
    <Modal onClose={onCancel} labelledBy="confirm-dialog-title">
      <div className="confirm-dialog">
        <span className={`confirm-dialog__icon ${danger ? "confirm-dialog__icon--danger" : ""}`}>
          <Icon name={resolvedIcon} size={22} />
        </span>
        <h2 id="confirm-dialog-title">{title}</h2>
        {description && <p className="text-muted">{description}</p>}
        {content && <div className="confirm-dialog__content">{content}</div>}
        <div className="confirm-dialog__actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} autoFocus={!danger}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
            onClick={onConfirm}
            autoFocus={danger}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
