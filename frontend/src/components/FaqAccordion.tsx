import { sanitizeRichText } from "../utils/richText";
import type { Faq } from "../types/course";

export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  if (faqs.length === 0) return null;

  return (
    <>
      {faqs.map((faq) => (
        <details key={faq.id}>
          <summary>{faq.question}</summary>
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: sanitizeRichText(faq.answer) }} />
        </details>
      ))}
    </>
  );
}
