// Navigation model (plan 3.1–3.2, D-04): 4 bottom-bar items; the rest live in the Menu.
export const PRIMARY_NAV = [
  { href: '/', label: 'Utama', icon: 'House' },
  { href: '/aktiviti', label: 'Aktiviti', icon: 'CalendarDays' },
  { href: '/kuliah', label: 'Kuliah', icon: 'BookOpen' },
  { href: '/perkhidmatan', label: 'Perkhidmatan', icon: 'Landmark' },
] as const;

export const MENU_NAV = [
  ...PRIMARY_NAV,
  { href: '/waktu-solat', label: 'Waktu Solat', icon: 'Clock' },
  { href: '/derma', label: 'Derma', icon: 'HandHeart' },
  { href: '/tentang/organisasi', label: 'Carta Organisasi', icon: 'Users' },
  { href: '/hubungi', label: 'Hubungi Kami', icon: 'Phone' },
] as const;

export type NavIcon = (typeof MENU_NAV)[number]['icon'];

export function isCurrent(href: string, path: string): boolean {
  const clean = path.replace(/\/$/, '') || '/';
  return href === '/' ? clean === '/' : clean === href || clean.startsWith(`${href}/`);
}
