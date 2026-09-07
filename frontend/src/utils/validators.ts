const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_ALLOWED_CHARS = /^\+?[0-9\s-]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function isValidWhatsappNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!WHATSAPP_ALLOWED_CHARS.test(trimmed)) return false;

  // Bound on digit count, not total string length — a well-formatted number with
  // spaces/dashes throughout (e.g. "+234-801-234-5678") can exceed 15 characters
  // while still having far fewer than 15 actual digits. 15 digits is the E.164 max.
  const digitCount = trimmed.replace(/[^0-9]/g, "").length;
  return digitCount >= 7 && digitCount <= 15;
}
