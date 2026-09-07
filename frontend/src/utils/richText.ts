/** Keep only the formatting supported by our editor, including on pasted content. */
export function sanitizeRichText(html: string | null | undefined): string {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  const allowed = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'UL', 'OL', 'LI', 'H2', 'H3', 'H4', 'BLOCKQUOTE', 'SPAN', 'DIV', 'CODE', 'PRE']);
  const clean = (parent: Element) => {
    for (const node of Array.from(parent.children)) {
      if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'SVG', 'MATH', 'TEMPLATE'].includes(node.tagName)) { node.remove(); continue; }
      clean(node);
      if (!allowed.has(node.tagName)) node.replaceWith(...Array.from(node.childNodes));
      else for (const attribute of Array.from(node.attributes)) node.removeAttribute(attribute.name);
    }
  };
  clean(doc.body);
  return doc.body.innerHTML;
}
