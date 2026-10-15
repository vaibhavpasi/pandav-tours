/**
 * Indian mobile number handling. Customers type numbers in many forms
 * ("98765 43210", "+91-98765-43210", "098765 43210"); everything is stored
 * as E.164 (+919876543210) so repeat customers match the same row.
 */

/** Returns +91XXXXXXXXXX for a valid Indian mobile number, else null. */
export function normalizeIndianMobile(input: string): string | null {
  let digits = input.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.startsWith("0091")) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);

  // Indian mobile numbers are 10 digits starting with 6–9.
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

/** "+919876543210" → "+91 98765 43210". Other formats are returned as-is. */
export function formatPhoneForDisplay(e164: string): string {
  const match = /^\+91(\d{5})(\d{5})$/.exec(e164);
  return match ? `+91 ${match[1]} ${match[2]}` : e164;
}

/** "+919876543210" → "tel:+919876543210" */
export function telHref(e164: string): string {
  return `tel:${e164}`;
}
