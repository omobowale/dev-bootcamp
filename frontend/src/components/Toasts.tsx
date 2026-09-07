import { useCallback, useEffect, useState } from 'react';
import { Icon } from './Icon';
import type { Notice } from '../lib/notify';
function Toast({ notice, dismiss }: { notice: Notice; dismiss: (id: number) => void }) {
  useEffect(() => { if (notice.kind === 'error') return; const timer = setTimeout(() => dismiss(notice.id), 5500); return () => clearTimeout(timer); }, [notice, dismiss]);
  return <div className={`toast toast--${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'}><span className="toast__icon"><Icon name={notice.kind === 'success' ? 'check' : notice.kind === 'error' ? 'shield' : 'spark'} size={19} /></span><div><strong>{notice.kind === 'error' ? 'That didn’t go through' : notice.kind === 'success' ? 'All set' : 'A quick note'}</strong><p>{notice.message}</p></div><button type="button" className="icon-button" aria-label="Dismiss notification" onClick={() => dismiss(notice.id)}><Icon name="close" size={16} /></button></div>;
}
export function Toasts() {
  const [notices, setNotices] = useState<Notice[]>([]);
  useEffect(() => { const receive = (event: Event) => setNotices(items => [...items.filter(item => item.message !== (event as CustomEvent<Notice>).detail.message).slice(-3), (event as CustomEvent<Notice>).detail]); window.addEventListener('ui:notice', receive); return () => window.removeEventListener('ui:notice', receive); }, []);
  const dismiss = useCallback((id: number) => setNotices(items => items.filter(item => item.id !== id)), []);
  return <div className="toast-stack" aria-label="Notifications">{notices.map(notice => <Toast key={notice.id} notice={notice} dismiss={dismiss} />)}</div>;
}
