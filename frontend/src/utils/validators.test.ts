import { describe, expect, it } from 'vitest';
import { isValidEmail, isValidWhatsappNumber } from './validators';

describe('isValidEmail', () => {
  it('accepts a normal email address', () => {
    expect(isValidEmail('jane@example.com')).toBe(true);
  });

  it('accepts an email with surrounding whitespace', () => {
    expect(isValidEmail('  jane@example.com  ')).toBe(true);
  });

  it('rejects a string with no @', () => {
    expect(isValidEmail('jane.example.com')).toBe(false);
  });

  it('rejects a string with no domain suffix', () => {
    expect(isValidEmail('jane@example')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

describe('isValidWhatsappNumber', () => {
  it('accepts an international number with a plus prefix', () => {
    expect(isValidWhatsappNumber('+2348012345678')).toBe(true);
  });

  it('accepts a number with spaces and dashes', () => {
    expect(isValidWhatsappNumber('+234 801-234-5678')).toBe(true);
  });

  it('accepts a fully-hyphenated number even though the total string exceeds 15 characters', () => {
    // Regression: the old regex bounded total string length (incl. separators) to 15,
    // rejecting well-formatted numbers like this one that has only 13 actual digits.
    expect(isValidWhatsappNumber('+234-801-234-5678')).toBe(true);
  });

  it('rejects a number that is too short', () => {
    expect(isValidWhatsappNumber('12345')).toBe(false);
  });

  it('rejects a number that is too long', () => {
    expect(isValidWhatsappNumber('1234567890123456')).toBe(false);
  });

  it('rejects letters', () => {
    expect(isValidWhatsappNumber('abcdefghij')).toBe(false);
  });
});
