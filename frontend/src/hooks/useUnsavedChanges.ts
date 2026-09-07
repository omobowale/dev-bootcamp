import { useEffect, useRef, type RefObject } from 'react';
import { useBlocker } from 'react-router-dom';
import { useConfirm } from '../context/ConfirmDialogContext';
export function useUnsavedChanges(dirty: boolean, allowNavigation?: RefObject<boolean>) {
  const confirm = useConfirm();
  const asking = useRef(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => dirty && !allowNavigation?.current && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state !== 'blocked') { asking.current = false; return; }
    if (asking.current) return;
    asking.current = true;
    void confirm({ title: 'Leave without saving?', description: 'Your latest changes haven’t been saved.', confirmLabel: 'Leave page', cancelLabel: 'Keep editing', icon: 'edit' }).then(leave => { if (leave) blocker.proceed(); else blocker.reset(); });
  }, [blocker, confirm]);
  useEffect(() => { if (!dirty) return; const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; }; window.addEventListener('beforeunload', unload); return () => window.removeEventListener('beforeunload', unload); }, [dirty]);
}
