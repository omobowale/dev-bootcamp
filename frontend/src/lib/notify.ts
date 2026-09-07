export type Notice = { id: number; message: string; kind: 'success' | 'error' | 'info' };
let serial = 0;
export function notify(message: string, kind: Notice['kind'] = 'success') {
  window.dispatchEvent(new CustomEvent<Notice>('ui:notice', { detail: { id: ++serial, message, kind } }));
}
