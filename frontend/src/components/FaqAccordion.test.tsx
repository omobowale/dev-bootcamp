import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FaqAccordion } from './FaqAccordion';
import type { Faq } from '../types/course';

const faqs: Faq[] = [
  { id: 1, courseId: null, question: 'How do I pay?', answer: 'Payment is handled manually.', position: 1 },
  { id: 2, courseId: null, question: 'Is there a certificate?', answer: 'Yes, on completion.', position: 2 },
];

describe('FaqAccordion', () => {
  it('renders a question/answer pair for every FAQ', () => {
    render(<FaqAccordion faqs={faqs} />);

    expect(screen.getByText('How do I pay?')).toBeInTheDocument();
    expect(screen.getByText('Payment is handled manually.')).toBeInTheDocument();
    expect(screen.getByText('Is there a certificate?')).toBeInTheDocument();
    expect(screen.getByText('Yes, on completion.')).toBeInTheDocument();
  });

  it('renders nothing when there are no FAQs', () => {
    const { container } = render(<FaqAccordion faqs={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders each FAQ as a native details/summary disclosure', () => {
    render(<FaqAccordion faqs={faqs} />);
    const details = document.querySelectorAll('details');
    expect(details).toHaveLength(2);
    expect(details[0].querySelector('summary')).toHaveTextContent('How do I pay?');
  });
});
