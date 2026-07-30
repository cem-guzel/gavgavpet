/**
 * Türkiye telefon numaralarını standart +90XXXXXXXXXX formatına çevirir.
 * Kabul edilen girdi formatları:
 *   - "0536 899 43 74"
 *   - "+90 536 899 43 74"
 *   - "536 899 43 74"
 *   - "05368994374"
 */
export function formatTurkishPhone(phone: string): string {
  const digits = phone.replace(/\D/g, ''); // sadece rakamları al

  if (digits.startsWith('90') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `+90${digits.slice(1)}`;
  }
  if (digits.length === 10) {
    return `+90${digits}`;
  }

  throw new Error('Geçersiz telefon numarası formatı');
}