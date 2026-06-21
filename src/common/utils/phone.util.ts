export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '').replace(/-/g, '');

  if (cleaned.startsWith('+84')) {
    return cleaned;
  }
  if (cleaned.startsWith('84') && cleaned.length >= 11) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+84${cleaned.slice(1)}`;
  }
  return `+84${cleaned}`;
}

export function isValidVietnamesePhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  return /^\+84[0-9]{9,10}$/.test(normalized);
}
