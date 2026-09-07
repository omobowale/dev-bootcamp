import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders the status text with underscores replaced by spaces', () => {
    render(<StatusBadge status="WHATSAPP_ADDED" />);
    expect(screen.getByText('WHATSAPP ADDED')).toBeInTheDocument();
  });

  it('applies a modifier class derived from the lowercased status', () => {
    render(<StatusBadge status="OPEN" />);
    expect(screen.getByText('OPEN')).toHaveClass('status-badge--open');
  });

  it('renders a different status correctly', () => {
    render(<StatusBadge status="CANCELLED" />);
    const badge = screen.getByText('CANCELLED');
    expect(badge).toHaveClass('status-badge--cancelled');
  });
});
