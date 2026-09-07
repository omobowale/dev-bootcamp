import { describe, expect, it } from 'vitest';
import { formatPrice } from './formatCurrency';

describe('formatPrice', () => {
  it('formats a positive number as Naira currency', () => {
    expect(formatPrice(250000)).toBe('₦250,000');
  });

  it('formats zero as a real price, not a fallback', () => {
    expect(formatPrice(0)).toBe('₦0');
  });

  it('falls back to a contact message for null', () => {
    expect(formatPrice(null)).toBe('Contact us for pricing');
  });

  it('falls back to a contact message for undefined', () => {
    expect(formatPrice(undefined)).toBe('Contact us for pricing');
  });

  it('rounds to whole currency units', () => {
    expect(formatPrice(99999.6)).toBe('₦100,000');
  });
});
