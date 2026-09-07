import { Icon } from "./Icon";
import "./StatusStates.css";

export function ErrorState({
  message = "Something went wrong loading this content.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="status-state" role="alert">
      <Icon name="globe" size={24} /><p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
