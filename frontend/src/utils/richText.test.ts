import { describe, expect, it } from 'vitest';
import { sanitizeRichText } from './richText';
describe('Course and FAQ rich text', () => {
  it('retains supported formatting while removing scripts and event handlers', () => {
    expect(sanitizeRichText('<p onclick="alert(1)">Hello <strong>learner</strong><img src=x onerror="alert(1)"><script>alert(1)</script></p>')).toBe('<p>Hello <strong>learner</strong></p>');
  });
  it('removes executable links, embedded SVG, and pasted styles', () => {
    expect(sanitizeRichText('<a href="javascript:alert(1)">link</a><svg onload="alert(1)"></svg><ul style="color:red"><li>Build</li></ul>')).toBe('link<ul><li>Build</li></ul>');
  });
});
