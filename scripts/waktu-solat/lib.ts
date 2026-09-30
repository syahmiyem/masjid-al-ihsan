// Parsing and validation for JAKIM e-Solat "takwimsolat" responses.
// Pure functions only, so they can be unit-tested without the network.

export const PRAYER_KEYS = [
  'imsak',
  'subuh',
  'syuruk',
  'dhuha',
  'zohor',
  'asar',
  'maghrib',
  'isyak',
] as const;

export type PrayerKey = (typeof PRAYER_KEYS)[number];

export type PrayerDay = { date: string; hijri: string } & Record<PrayerKey, string>;

export type PrayerYear = {
  source: string;
  sourceUrl: string;
  zone: string;
  year: number;
  fetchedAt: string;
  days: PrayerDay[];
};

// e-Solat uses Malay month abbreviations, e.g. "01-Okt-2026", "15-Ogos-2026".
const MALAY_MONTHS: Record<string, string> = {
  Jan: '01',
  Feb: '02',
  Mac: '03',
  Apr: '04',
  Mei: '05',
  Jun: '06',
  Jul: '07',
  Ogos: '08',
  Ogo: '08',
  Sep: '09',
  Okt: '10',
  Nov: '11',
  Dis: '12',
};

// e-Solat field name -> our field name
const FIELD_MAP: Record<string, PrayerKey> = {
  imsak: 'imsak',
  fajr: 'subuh',
  syuruk: 'syuruk',
  dhuha: 'dhuha',
  dhuhr: 'zohor',
  asr: 'asar',
  maghrib: 'maghrib',
  isha: 'isyak',
};

export function parseMalayDate(value: string): string {
  const match = /^(\d{2})-([A-Za-z]+)-(\d{4})$/.exec(value);
  const month = match && MALAY_MONTHS[match[2]];
  if (!match || !month) throw new Error(`Unrecognised e-Solat date: "${value}"`);
  return `${match[3]}-${month}-${match[1]}`;
}

function parseTime(value: unknown, context: string): string {
  const match = typeof value === 'string' ? /^(\d{2}):(\d{2})(?::00)?$/.exec(value) : null;
  if (!match) throw new Error(`Invalid time ${JSON.stringify(value)} (${context})`);
  return `${match[1]}:${match[2]}`;
}

/** Returns null when e-Solat has no data yet for the requested period (e.g. next year). */
export function parseResponse(body: unknown): PrayerDay[] | null {
  const response = body as { status?: string; prayerTime?: unknown };
  if (response?.status === 'NO_RECORD!') return null;
  if (response?.status !== 'OK!' || !Array.isArray(response.prayerTime)) {
    throw new Error(`Unexpected e-Solat response status: ${JSON.stringify(response?.status)}`);
  }
  return response.prayerTime.map((raw: Record<string, unknown>) => {
    const date = parseMalayDate(String(raw.date));
    const day = { date, hijri: String(raw.hijri) } as PrayerDay;
    for (const [from, to] of Object.entries(FIELD_MAP)) {
      day[to] = parseTime(raw[from], `${date} ${from}`);
    }
    return day;
  });
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Throws with every problem found, so a bad fetch never replaces good data. */
export function validateYear(days: PrayerDay[], year: number): void {
  const problems: string[] = [];
  const expected = isLeapYear(year) ? 366 : 365;
  if (days.length !== expected) problems.push(`expected ${expected} days, got ${days.length}`);

  const cursor = new Date(Date.UTC(year, 0, 1));
  days.forEach((day, i) => {
    const want = cursor.toISOString().slice(0, 10);
    if (day.date !== want) problems.push(`day ${i + 1}: expected ${want}, got ${day.date}`);
    cursor.setUTCDate(cursor.getUTCDate() + 1);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(day.hijri)) problems.push(`${day.date}: invalid hijri "${day.hijri}"`);

    for (let k = 1; k < PRAYER_KEYS.length; k++) {
      const prev = PRAYER_KEYS[k - 1];
      const curr = PRAYER_KEYS[k];
      if (!(day[prev] < day[curr])) {
        problems.push(`${day.date}: ${prev} ${day[prev]} is not before ${curr} ${day[curr]}`);
      }
    }
  });

  if (problems.length) {
    const shown = problems.slice(0, 20).join('\n  ');
    const more = problems.length > 20 ? `\n  …and ${problems.length - 20} more` : '';
    throw new Error(`Waktu Solat data for ${year} failed validation:\n  ${shown}${more}`);
  }
}

/** True when the prayer data differs (ignores fetchedAt so unchanged data causes no commit). */
export function hasChanged(previous: PrayerYear | null, next: PrayerYear): boolean {
  if (!previous) return true;
  return previous.zone !== next.zone || JSON.stringify(previous.days) !== JSON.stringify(next.days);
}
