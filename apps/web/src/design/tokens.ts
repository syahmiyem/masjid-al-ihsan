// Design tokens: the single source for colours (plan 5.4). BaseLayout turns these into CSS custom
// properties, and design/contrast.test.ts checks every pair below against WCAG thresholds (D-50, D-51).

export const colours = {
  // Official mosque colours (D-53): navy #172061, cream #FDF1D3, gold #FFD38B
  primary: '#172061',
  primaryHover: '#0e1440',
  onPrimary: '#ffffff',
  primarySoft: '#FDF1D3',
  accent: '#FFD38B',
  text: '#1a1a1a',
  textMuted: '#474b62',
  bg: '#ffffff',
  surface: '#fff9ec',
  border: '#7a7f99',
  focus: '#172061',
  focusHalo: '#FFD38B',
  uatBg: '#fff4c2',
  uatText: '#3d2e00',
  // Status labels — always shown with text, never colour alone (1.4.1)
  cancelledBg: '#fbe4e4',
  cancelledText: '#8a1616',
  postponedBg: '#fff1cc',
  postponedText: '#5c3d00',
  changedBg: '#e3eefb',
  changedText: '#123f78',
  pastBg: '#ececec',
  pastText: '#454545',
  urgentBg: '#8a1616',
  onUrgent: '#ffffff',
} as const;

export type ColourName = keyof typeof colours;

/** [foreground, background, minimum ratio, what it is] */
export const contrastPairs: [ColourName, ColourName, number, string][] = [
  ['text', 'bg', 7, 'body text'],
  ['text', 'surface', 7, 'body text on cards'],
  ['textMuted', 'bg', 7, 'secondary text'],
  ['textMuted', 'surface', 7, 'secondary text on cards'],
  ['primary', 'bg', 7, 'links and headings'],
  ['primary', 'surface', 7, 'links on cards'],
  ['onPrimary', 'primary', 7, 'primary button text / header title'],
  ['onPrimary', 'primaryHover', 7, 'primary button text (hover)'],
  ['primarySoft', 'primary', 7, 'cream text on navy (header, menu)'],
  ['accent', 'primary', 7, 'gold text on navy (menu, highlights)'],
  ['primary', 'accent', 7, 'navy on gold (Menu button, next prayer)'],
  ['primary', 'primarySoft', 7, 'secondary button text'],
  ['text', 'primarySoft', 7, 'text on active nav item'],
  ['uatText', 'uatBg', 7, 'test-site banner'],
  ['cancelledText', 'cancelledBg', 7, 'DIBATALKAN label'],
  ['postponedText', 'postponedBg', 7, 'DITANGGUHKAN label'],
  ['changedText', 'changedBg', 7, 'DIPINDA label'],
  ['pastText', 'pastBg', 7, '"Telah berlangsung" label'],
  ['onUrgent', 'urgentBg', 7, 'urgent notice banner'],
  ['border', 'bg', 3, 'input and card borders (1.4.11)'],
  ['border', 'surface', 3, 'card borders on cream'],
  ['focus', 'bg', 3, 'focus ring (2.4.13)'],
  ['focus', 'focusHalo', 3, 'focus ring against its halo'],
  ['accent', 'primary', 3, 'gold focus ring on navy (menu)'],
];

export function cssVariables(): string {
  const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  return Object.entries(colours)
    .map(([name, value]) => `--c-${kebab(name)}: ${value};`)
    .join(' ');
}
