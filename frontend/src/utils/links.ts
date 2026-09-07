export function safeUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}
export function whatsappLink(number?: string, message = '') { return number && /^[0-9]{7,15}$/.test(number) ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : undefined; }
