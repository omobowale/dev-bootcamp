import "./StatusStates.css";

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="status-state" role="status" aria-live="polite">
      <div className="loader-orbit" aria-hidden="true"><span /><span /><span /><span /></div><div className="loader-lines" aria-hidden="true"><i /><i /><i /></div>
      <p className="text-muted">{label}</p>
    </div>
  );
}
