import { Icon } from "./Icon";
import "./StatusStates.css";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="status-state">
      <Icon name="book" size={24} /><p className="text-muted">{message}</p>
    </div>
  );
}
