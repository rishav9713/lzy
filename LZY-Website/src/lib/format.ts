const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** "2026-09-19" -> "19 September 2026", without depending on the reader's locale. */
export function formatDate(date: string | null | undefined): string {
  if (!date) return '';
  const [year, month, day] = date.split('-').map(Number);
  if (!year || !month || !day) return date;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}
