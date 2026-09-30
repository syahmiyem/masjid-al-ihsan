// Fixed option lists shared by several document types (docs/plan.md Section 4).
// Values are stable slugs used by the website; titles are what editors see.

export const CATEGORIES = [
  { title: 'Kuliah', value: 'kuliah' },
  { title: 'Program Khas', value: 'program-khas' },
  { title: 'Kelas', value: 'kelas' },
  { title: 'Gotong-royong', value: 'gotong-royong' },
  { title: 'Kenduri / Majlis', value: 'kenduri-majlis' },
  { title: 'Mesyuarat', value: 'mesyuarat' },
  { title: 'Lain-lain', value: 'lain-lain' },
];

export const AUDIENCES = [
  { title: 'Umum', value: 'umum' },
  { title: 'Muslimah', value: 'muslimah' },
  { title: 'Kanak-kanak', value: 'kanak-kanak' },
  { title: 'Remaja', value: 'remaja' },
];

export const ACTIVITY_STATUSES = [
  { title: 'Dijadualkan', value: 'dijadualkan' },
  { title: 'Dipinda', value: 'dipinda' },
  { title: 'Ditangguhkan', value: 'ditangguhkan' },
  { title: 'Dibatalkan', value: 'dibatalkan' },
];

// Prayer-relative times (D-12). The website fills in the official time from Waktu Solat data (plan 4.8).
export const PRAYER_RELATIVE = [
  { title: 'Selepas Subuh', value: 'selepas-subuh' },
  { title: 'Sebelum Zohor', value: 'sebelum-zohor' },
  { title: 'Selepas Zohor', value: 'selepas-zohor' },
  { title: 'Selepas solat Jumaat', value: 'selepas-jumaat' },
  { title: 'Selepas Asar', value: 'selepas-asar' },
  { title: 'Sebelum Maghrib', value: 'sebelum-maghrib' },
  { title: 'Selepas Maghrib', value: 'selepas-maghrib' },
  { title: 'Selepas Isyak', value: 'selepas-isyak' },
];

export const WEEKDAYS = [
  { title: 'Isnin', value: 'isnin' },
  { title: 'Selasa', value: 'selasa' },
  { title: 'Rabu', value: 'rabu' },
  { title: 'Khamis', value: 'khamis' },
  { title: 'Jumaat', value: 'jumaat' },
  { title: 'Sabtu', value: 'sabtu' },
  { title: 'Ahad', value: 'ahad' },
];

export const ORG_GROUPS = [
  { title: 'Penaung', value: 'penaung' },
  { title: 'Pengurusan Utama', value: 'pengurusan-utama' },
  { title: 'Pegawai Masjid', value: 'pegawai-masjid' },
  { title: 'AJK Biro', value: 'ajk-biro' },
];

export const titleOf = (list: { title: string; value: string }[], value?: string) =>
  list.find((item) => item.value === value)?.title ?? value ?? '';
