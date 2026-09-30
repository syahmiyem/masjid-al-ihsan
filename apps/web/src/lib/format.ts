// Malay date and time formatting (plan 5.3, D-05): "Isnin, 6 Oktober 2026" and "8:30 malam".
// Dates are ISO strings (YYYY-MM-DD) in Asia/Kuala_Lumpur; no numeric-only dates are shown to users.

const DAYS = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
const MONTHS = [
  'Januari',
  'Februari',
  'Mac',
  'April',
  'Mei',
  'Jun',
  'Julai',
  'Ogos',
  'September',
  'Oktober',
  'November',
  'Disember',
];
const HIJRI_MONTHS = [
  'Muharam',
  'Safar',
  'Rabiulawal',
  'Rabiulakhir',
  'Jamadilawal',
  'Jamadilakhir',
  'Rejab',
  'Syaaban',
  'Ramadan',
  'Syawal',
  'Zulkaedah',
  'Zulhijah',
];

function parts(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Expected YYYY-MM-DD, got "${iso}"`);
  const [y, m, d] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return { y, m, d, weekday: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
}

/** "Selasa, 6 Oktober 2026" */
export function formatDate(iso: string): string {
  const { y, m, d, weekday } = parts(iso);
  return `${DAYS[weekday]}, ${d} ${MONTHS[m - 1]} ${y}`;
}

/** "6 Okt" style is avoided for older readers; this is the short form without weekday: "6 Oktober 2026" */
export function formatDateShort(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function dayName(iso: string): string {
  return DAYS[parts(iso).weekday];
}

export function monthName(month: number): string {
  return MONTHS[month - 1];
}

/** "1448-04-19" → "19 Rabiulakhir 1448" */
export function formatHijri(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d} ${HIJRI_MONTHS[m - 1]} ${y}`;
}

/** "20:30" → "8:30 malam". pagi < 12:00 ≤ tengah hari < 14:00 ≤ petang < 19:00 ≤ malam */
export function formatTime(hhmm: string): string {
  const match = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!match) throw new Error(`Expected HH:MM, got "${hhmm}"`);
  const h = Number(match[1]);
  const period = h < 12 ? 'pagi' : h < 14 ? 'tengah hari' : h < 19 ? 'petang' : 'malam';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${match[2]} ${period}`;
}
