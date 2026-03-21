const MONTH_MAP: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

export function parseEventDate(raw: string): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed || trimmed.toLowerCase() === 'tbc') return null;

  // Normalise "Sept" → "Sep", "June" → "Jun", etc.
  const normalised = trimmed.replace(/\b(sept)\b/i, 'Sep');

  // Match d-Mmm-yyyy or dd-Mmm-yyyy
  const match = normalised.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);
  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthKey = match[2].toLowerCase();
  const year = parseInt(match[3], 10);

  const month = MONTH_MAP[monthKey];
  if (month === undefined) return null;
  if (day === 0 || day > 31) return null;

  const date = new Date(year, month, day);
  // Validate the date didn't roll over (e.g. Feb 30)
  if (date.getMonth() !== month) return null;

  return date;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
