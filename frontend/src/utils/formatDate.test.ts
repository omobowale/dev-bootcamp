import { describe, expect, it } from 'vitest';
import { formatDate, formatDateRange } from './formatDate';

describe('formatDate', () => {
  it('formats an ISO date as "D MMM YYYY"', () => {
    expect(formatDate('2027-01-12')).toBe('12 Jan 2027');
  });

  it('returns null for null input', () => {
    expect(formatDate(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(formatDate(undefined)).toBeNull();
  });

  it('returns null for an unparsable date string', () => {
    expect(formatDate('not-a-date')).toBeNull();
  });
});

describe('formatDateRange', () => {
  it('joins two valid dates with an en dash', () => {
    expect(formatDateRange('2027-01-12', '2027-04-06')).toBe('12 Jan 2027 – 6 Apr 2027');
  });

  it('falls back to just the start date when end is missing', () => {
    expect(formatDateRange('2027-01-12', null)).toBe('12 Jan 2027');
  });

  it('falls back to just the end date when start is missing', () => {
    expect(formatDateRange(null, '2027-04-06')).toBe('6 Apr 2027');
  });

  it('returns null when both are missing', () => {
    expect(formatDateRange(null, null)).toBeNull();
  });
});
