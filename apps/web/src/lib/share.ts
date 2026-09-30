// Pre-written share messages (plan 4.4): short, plain Malay, always naming the mosque and place.
import { formatDate, lowerFirst } from './format.ts';

const PLACE = 'Masjid Al-Ihsan, Felda Sg Panching Selatan';

export const shareActivity = (title: string, date: string, time: string) =>
  `${title} – ${formatDate(date)}, ${time}, di ${PLACE}. Maklumat lanjut:`;

export const shareKuliah = (name: string, rule: string, time: string) =>
  `${name} – ${rule}, ${lowerFirst(time)}, di ${PLACE}. Maklumat lanjut:`;

export const sharePage = (what: string) => `${what} – ${PLACE}:`;

/** Location line for calendar entries */
export const calendarLocation = (place: string) => `${place}, ${PLACE}, Kuantan, Pahang`;
