import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';

describe('LoadingState', () => {
  it('shows a default label', () => {
    render(<LoadingState />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows a custom label', () => {
    render(<LoadingState label="Loading courses…" />);
    expect(screen.getByText('Loading courses…')).toBeInTheDocument();
  });

  it('exposes a polite status role for screen readers', () => {
    render(<LoadingState />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('ErrorState', () => {
  it('shows a default message with no retry button', () => {
    render(<ErrorState />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState message="Couldn't load data." onRetry={onRetry} />);

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('EmptyState', () => {
  it('renders the provided message', () => {
    render(<EmptyState message="No courses match this filter yet." />);
    expect(screen.getByText('No courses match this filter yet.')).toBeInTheDocument();
  });
});
