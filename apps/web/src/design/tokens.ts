// Design tokens: the single source for colours (plan 5.4). BaseLayout turns these into CSS custom
// properties, and design/contrast.test.ts checks every pair below against WCAG thresholds (D-50, D-51).

export const colours = {
  text: '#1a1a1a',
  textMuted: '#454545',
  bg: '#ffffff',
  surface: '#f2f6f3',
  border: '#6f7d74',
  primary: '#0a5a39',
  primaryHover: '#07432a',
  onPrimary: '#ffffff',
  primarySoft: '#e3efe8',
  focus: '#1a1a1a',
  focusHalo: '#ffd23f',
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
  ['primary', 'bg', 7, 'links'],
  ['primary', 'surface', 7, 'links on cards'],
  ['onPrimary', 'primary', 7, 'primary button text'],
  ['onPrimary', 'primaryHover', 7, 'primary button text (hover)'],
  ['primary', 'primarySoft', 7, 'secondary button text'],
  ['text', 'primarySoft', 7, 'text on active nav item'],
  ['uatText', 'uatBg', 7, 'test-site banner'],
  ['cancelledText', 'cancelledBg', 7, 'DIBATALKAN label'],
  ['postponedText', 'postponedBg', 7, 'DITANGGUHKAN label'],
  ['changedText', 'changedBg', 7, 'DIPINDA label'],
  ['pastText', 'pastBg', 7, '"Telah berlangsung" label'],
  ['onUrgent', 'urgentBg', 7, 'urgent notice banner'],
  ['border', 'bg', 3, 'input and card borders (1.4.11)'],
  ['focus', 'bg', 3, 'focus ring (2.4.13)'],
  ['focus', 'focusHalo', 3, 'focus ring against its halo'],
];

export function cssVariables(): string {
  const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  return Object.entries(colours)
    .map(([name, value]) => `--c-${kebab(name)}: ${value};`)
    .join(' ');
}
