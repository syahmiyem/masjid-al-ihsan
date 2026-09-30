// Shared poster frame (plan 4.4 design rules): high contrast, large text (≥ 32px on 1080px), mosque name
// and address on every image, "Dikemas kini" date so forwarded images carry their freshness, and a
// yellow "LAMAN PERCUBAAN" band on every image while the site is in UAT mode.
import { colours as c } from '../design/tokens.ts';
import { h, type Child, type PosterNode } from './h.ts';

export const FORMATS = {
  potret: { width: 1080, height: 1350, label: 'Potret (kiriman)' },
  status: { width: 1080, height: 1920, label: 'Status WhatsApp' },
  og: { width: 1200, height: 630, label: 'Pratonton pautan' },
} as const;
export type FormatKey = keyof typeof FORMATS;

export const PAD = 56;
const HEADER = 150;
const FOOTER = 124;
const UAT_BAND = 64;
export const TITLE_BLOCK = 150;

export type FrameInfo = { uat: boolean; host: string; updated: string; source?: string };

/** Height available for body content below the title block. */
export function bodyBudget(format: FormatKey, uat: boolean): number {
  return FORMATS[format].height - HEADER - FOOTER - TITLE_BLOCK - (uat ? UAT_BAND : 0) - 24;
}

export function frame(
  format: FormatKey,
  info: FrameInfo,
  title: Child,
  subtitle: Child,
  body: PosterNode,
): PosterNode {
  const { width, height } = FORMATS[format];
  return h(
    'div',
    { width, height, flexDirection: 'column', background: c.bg, color: c.text, fontFamily: 'Atkinson' },
    info.uat &&
      h(
        'div',
        {
          height: UAT_BAND,
          background: c.uatBg,
          color: c.uatText,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 700,
          borderBottom: `4px solid ${c.uatText}`,
        },
        'LAMAN PERCUBAAN — CONTOH, BUKAN RASMI',
      ),
    h(
      'div',
      {
        height: HEADER,
        background: c.primary,
        color: c.onPrimary,
        flexDirection: 'column',
        justifyContent: 'center',
        padding: `0 ${PAD}px`,
      },
      h('div', { fontSize: 52, fontWeight: 700, lineHeight: 1.1 }, 'Masjid Al-Ihsan'),
      h('div', { fontSize: 34, marginTop: 6, color: c.primarySoft }, 'Felda Sg Panching Selatan, Kuantan'),
    ),
    h(
      'div',
      {
        height: TITLE_BLOCK,
        flexDirection: 'column',
        justifyContent: 'center',
        padding: `0 ${PAD}px`,
        borderBottom: `3px solid ${c.primary}`,
      },
      h('div', { fontSize: 56, fontWeight: 700, lineHeight: 1.1 }, title),
      subtitle ? h('div', { fontSize: 34, color: c.textMuted, marginTop: 8 }, subtitle) : null,
    ),
    // overflow hidden: an over-long body is cut off rather than pushing the footer off the image
    h(
      'div',
      {
        flexGrow: 1,
        flexShrink: 1,
        minHeight: 0,
        overflow: 'hidden',
        flexDirection: 'column',
        padding: `12px ${PAD}px 0`,
      },
      body,
    ),
    h(
      'div',
      {
        height: FOOTER,
        background: c.surface,
        borderTop: `2px solid ${c.border}`,
        flexDirection: 'column',
        justifyContent: 'center',
        padding: `0 ${PAD}px`,
      },
      h('div', { fontSize: 32, fontWeight: 700 }, info.host),
      h(
        'div',
        { fontSize: 32, color: c.textMuted },
        `Dikemas kini: ${info.updated}${info.source ? ` · ${info.source}` : ''}`,
      ),
    ),
  );
}
