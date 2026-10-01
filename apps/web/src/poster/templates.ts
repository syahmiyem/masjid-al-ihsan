// Poster templates (plan 4.4, D-31). Every text size is ≥ 32px on a 1080px-wide canvas. Long lists are
// split into "Bahagian 1/2, 2/2" by paginate() instead of shrinking text.
import { colours as c } from '../design/tokens.ts';
import { bodyBudget, FORMATS, frame, PAD, type FormatKey, type FrameInfo } from './frame.ts';
import { clip, h, img, type PosterNode } from './h.ts';
import { paginate, type Block } from './paginate.ts';

const ONE_LINE = { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } as const;
const partLabel = (i: number, n: number) => (n > 1 ? `Bahagian ${i + 1}/${n}` : '');
const join = (...parts: (string | undefined | false)[]) => parts.filter(Boolean).join(' · ');

const STATUS_BG: Record<string, string> = {
  dibatalkan: c.cancelledBg,
  ditangguhkan: c.postponedBg,
  dipinda: c.changedBg,
};
const STATUS_COLOUR: Record<string, string> = {
  dibatalkan: c.cancelledText,
  ditangguhkan: c.postponedText,
  dipinda: c.changedText,
};

// ─── Lists (month calendar, Minggu Ini, weekly kuliah, org chart) ───────────────────────────────

export type EventRow = {
  date?: string; // shown as a date block on the first row of each day
  dayShort?: string;
  dayNum?: number;
  title: string;
  meta: string;
  status?: string; // dibatalkan | ditangguhkan | dipinda
  statusText?: string;
  /** No date column: for rows grouped under a heading */
  wide?: boolean;
  /** Optional third line, e.g. the speaker */
  extra?: string;
  /** Speaker photo (data URL) or initials, shown as a circle on the right */
  avatar?: Avatar;
};
export type Avatar = { src?: string; initials: string };

function avatarNode(a: Avatar, size: number): PosterNode {
  return a.src
    ? img(a.src, size, size, { borderRadius: size / 2, border: `4px solid ${c.accent}` })
    : h(
        'div',
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          background: c.primary,
          color: c.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(size * 0.38),
          fontWeight: 700,
          border: `4px solid ${c.accent}`,
        },
        a.initials,
      );
}
export type ListBlock = { kind: 'heading'; text: string } | { kind: 'row'; row: EventRow };

const ROW_H = 112;
const HEADING_H = 76;

function renderBlock(b: ListBlock): PosterNode {
  if (b.kind === 'heading') {
    return h(
      'div',
      {
        height: HEADING_H,
        alignItems: 'flex-end',
        paddingBottom: 10,
        fontSize: 40,
        fontWeight: 700,
        color: c.primary,
      },
      b.text,
    );
  }
  const r = b.row;
  // Rows under a heading (Minggu Ini, timetable, org chart) use the full width; calendar rows keep a date column
  const full = FORMATS.potret.width - 2 * PAD;
  return h(
    'div',
    { height: rowHeight(r), alignItems: 'center', borderBottom: `2px solid ${c.surface}` },
    r.wide
      ? null
      : h(
          'div',
          {
            width: 120,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 24,
          },
          r.dayNum !== undefined
            ? [
                h('div', { fontSize: 32, color: c.textMuted, lineHeight: 1.1 }, r.dayShort ?? ''),
                h('div', { fontSize: 52, fontWeight: 700, lineHeight: 1.05 }, String(r.dayNum)),
              ]
            : null,
        ),
    h(
      'div',
      { flexDirection: 'column', width: (r.wide ? full : full - 144) - (r.avatar ? 104 : 0) },
      h(
        'div',
        {
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1.25,
          ...ONE_LINE,
          textDecoration: r.status === 'dibatalkan' ? 'line-through' : 'none',
        },
        clip(r.title, r.wide ? 46 : 40),
      ),
      h(
        'div',
        { fontSize: 32, color: c.textMuted, lineHeight: 1.3, ...ONE_LINE },
        r.status && STATUS_COLOUR[r.status]
          ? h(
              'span',
              { color: STATUS_COLOUR[r.status], fontWeight: 700, marginRight: 12 },
              r.statusText ?? r.status.toUpperCase(),
            )
          : null,
        clip(r.meta, (r.status ? 30 : 46) + (r.wide ? 8 : 0)),
      ),
      r.extra
        ? h('div', { fontSize: 32, color: c.textMuted, lineHeight: 1.3, ...ONE_LINE }, clip(r.extra, 54))
        : null,
    ),
    r.avatar ? h('div', { marginLeft: 'auto', paddingLeft: 16 }, avatarNode(r.avatar, 88)) : null,
  );
}

const rowHeight = (r: EventRow) => ROW_H + (r.extra ? 42 : 0);

export function listPosters(
  format: FormatKey,
  info: FrameInfo,
  title: string,
  subtitle: string,
  blocks: ListBlock[],
): PosterNode[] {
  const sized: Block<ListBlock>[] = blocks.map((b) =>
    b.kind === 'heading'
      ? { height: HEADING_H, value: b, keepWithNext: true }
      : { height: rowHeight(b.row), value: b },
  );
  const pages = paginate(sized, bodyBudget(format, info.uat));
  if (pages.length === 0) pages.push([]);
  return pages.map((page, i) =>
    frame(
      format,
      info,
      title,
      join(subtitle, partLabel(i, pages.length)),
      h(
        'div',
        { flexDirection: 'column' },
        page.length
          ? page.map(renderBlock)
          : h('div', { fontSize: 36, marginTop: 24 }, 'Tiada aktiviti dijadualkan.'),
      ),
    ),
  );
}

// ─── Single item (activity, kuliah series, service) ─────────────────────────────────────────────

export type ItemPoster = {
  kicker: string; // "Aktiviti", "Kuliah Mingguan", "Khidmat"
  title: string;
  status?: { kind: string; text: string; note?: string };
  facts: [label: string, value: string][];
  bullets?: string[];
  description?: string;
  footerLine?: string; // e.g. "Maklumat lanjut: /aktiviti/…"
  speaker?: { name: string; role?: string; avatar: Avatar };
};

export function itemPoster(format: FormatKey, info: FrameInfo, p: ItemPoster): PosterNode {
  const tall = format === 'status';
  // Stay within the portrait budget: less description when a status box and many facts compete for space
  const crowded =
    Boolean(p.status) || Boolean(p.speaker) || p.facts.length >= 4 || (p.bullets?.length ?? 0) > 3;
  const descMax = tall ? 330 : crowded ? 70 : 130;
  return frame(
    format,
    info,
    p.kicker,
    '',
    h(
      'div',
      { flexDirection: 'column' },
      p.status &&
        h(
          'div',
          {
            flexDirection: 'column',
            background: STATUS_BG[p.status.kind] ?? c.surface,
            color: STATUS_COLOUR[p.status.kind] ?? c.text,
            padding: '16px 24px',
            borderRadius: 12,
            marginTop: 12,
          },
          h('div', { fontSize: 40, fontWeight: 700 }, p.status.text),
          p.status.note ? h('div', { fontSize: 32 }, clip(p.status.note, 90)) : null,
        ),
      h('div', { fontSize: 60, fontWeight: 700, lineHeight: 1.12, marginTop: 20 }, clip(p.title, 75)),
      p.speaker
        ? h(
            'div',
            {
              alignItems: 'center',
              marginTop: 20,
              padding: '14px 18px',
              background: c.primarySoft,
              borderRadius: 16,
            },
            avatarNode(p.speaker.avatar, tall ? 180 : 132),
            h(
              'div',
              {
                flexDirection: 'column',
                marginLeft: 24,
                width: FORMATS.potret.width - 2 * PAD - (tall ? 180 : 132) - 60,
              },
              h('div', { fontSize: 32, color: c.textMuted }, 'Penceramah'),
              h(
                'div',
                { fontSize: 42, fontWeight: 700, color: c.primary, lineHeight: 1.15 },
                clip(p.speaker.name, 40),
              ),
              p.speaker.role
                ? h('div', { fontSize: 32, color: c.textMuted }, clip(p.speaker.role, 44))
                : null,
            ),
          )
        : null,
      h(
        'div',
        { flexDirection: 'column', marginTop: 20 },
        p.facts.map(([label, value]) =>
          h(
            'div',
            { flexDirection: 'column', padding: '10px 0', borderTop: `2px solid ${c.surface}` },
            h('div', { fontSize: 32, color: c.textMuted }, label),
            h('div', { fontSize: 40, fontWeight: 700, lineHeight: 1.2 }, clip(value, 44)),
          ),
        ),
      ),
      p.bullets?.length
        ? h(
            'div',
            { flexDirection: 'column', marginTop: 12 },
            p.bullets
              .slice(0, tall ? 8 : 5)
              .map((b) => h('div', { fontSize: 36, lineHeight: 1.4 }, `• ${clip(b, 40)}`)),
          )
        : null,
      p.description
        ? h('div', { fontSize: 36, lineHeight: 1.35, marginTop: 16 }, clip(p.description, descMax))
        : null,
      p.footerLine && !(crowded && !tall)
        ? h('div', { fontSize: 32, color: c.primary, fontWeight: 700, marginTop: 20 }, p.footerLine)
        : null,
    ),
  );
}

// ─── Link preview (1200 × 630) ──────────────────────────────────────────────────────────────────

export function ogPoster(info: FrameInfo, kicker: string, title: string, lines: string[]): PosterNode {
  const { width, height } = FORMATS.og;
  return h(
    'div',
    {
      width,
      height,
      flexDirection: 'column',
      background: c.primary,
      color: c.onPrimary,
      fontFamily: 'Nunito Sans',
    },
    info.uat &&
      h(
        'div',
        {
          height: 56,
          background: c.uatBg,
          color: c.uatText,
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 30,
          fontWeight: 700,
        },
        'LAMAN PERCUBAAN — CONTOH, BUKAN RASMI',
      ),
    h(
      'div',
      { flexGrow: 1, flexDirection: 'column', justifyContent: 'center', padding: '0 70px' },
      h('div', { fontSize: 32, color: c.primarySoft, textTransform: 'uppercase', letterSpacing: 2 }, kicker),
      h('div', { fontSize: 64, fontWeight: 700, lineHeight: 1.1, marginTop: 12 }, clip(title, 60)),
      ...lines.map((l) => h('div', { fontSize: 36, marginTop: 12, color: c.primarySoft }, clip(l, 56))),
    ),
    h(
      'div',
      { height: 70, background: c.primaryHover, alignItems: 'center', padding: '0 70px', fontSize: 32 },
      'Masjid Al-Ihsan · Felda Sg Panching Selatan, Kuantan',
    ),
  );
}

// ─── Waktu Solat ────────────────────────────────────────────────────────────────────────────────

export type PrayerRow = { day: string; times: string[]; friday: boolean };
const PRAYER_COLS = ['Subuh', 'Zohor', 'Asar', 'Maghrib', 'Isyak'];
const TABLE_ROW = 42;
const TABLE_HEAD = 56;

export function prayerMonthPosters(
  format: FormatKey,
  info: FrameInfo,
  title: string,
  zone: string,
  rows: PrayerRow[],
): PosterNode[] {
  const perPage = Math.floor((bodyBudget(format, info.uat) - TABLE_HEAD) / TABLE_ROW);
  const parts = Math.ceil(rows.length / perPage);
  const size = Math.ceil(rows.length / parts); // balance the parts (16 + 15, not 19 + 12)
  const chunks = Array.from({ length: parts }, (_, i) => rows.slice(i * size, (i + 1) * size));
  const dateW = 180;
  const colW = Math.floor((FORMATS[format].width - 2 * PAD - dateW) / 5);
  const cell = (text: string, w: number, bold = false, align: 'flex-start' | 'center' = 'center') =>
    h('div', { width: w, justifyContent: align, fontSize: 32, fontWeight: bold ? 700 : 400 }, text);
  return chunks.map((chunk, i) =>
    frame(
      format,
      info,
      title,
      join(zone, partLabel(i, parts)),
      h(
        'div',
        { flexDirection: 'column' },
        h(
          'div',
          { height: TABLE_HEAD, alignItems: 'center', borderBottom: `3px solid ${c.primary}` },
          cell('Tarikh', dateW, true, 'flex-start'),
          ...PRAYER_COLS.map((p) => cell(p, colW, true)),
        ),
        ...chunk.map((r, j) =>
          h(
            'div',
            { height: TABLE_ROW, alignItems: 'center', background: j % 2 ? c.surface : c.bg },
            cell(r.day, dateW, r.friday, 'flex-start'),
            ...r.times.map((t, k) => cell(t, colW, r.friday && k === 1)),
          ),
        ),
      ),
    ),
  );
}

export function prayerTodayPoster(
  format: FormatKey,
  info: FrameInfo,
  dateLine: string,
  rows: [string, string][],
): PosterNode {
  const rowH = format === 'status' ? 128 : 96;
  return frame(
    format,
    info,
    'Waktu Solat Hari Ini',
    dateLine,
    h(
      'div',
      { flexDirection: 'column', marginTop: 8 },
      rows.map(([name, time]) =>
        h(
          'div',
          {
            height: rowH,
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `2px solid ${c.surface}`,
          },
          h('div', { fontSize: 48 }, name),
          h('div', { fontSize: 52, fontWeight: 700 }, time),
        ),
      ),
    ),
  );
}

// ─── Sumbangan (Derma) ──────────────────────────────────────────────────────────────────────────────────

export type DermaPoster = {
  contoh: boolean;
  qrDataUrl: string;
  accountName: string;
  bank: string;
  accountNumber: string;
};

export function dermaPoster(format: FormatKey, info: FrameInfo, d: DermaPoster): PosterNode {
  const qr = format === 'status' ? 620 : 400;
  return frame(
    format,
    info,
    'Sumbangan untuk Masjid',
    d.contoh ? 'CONTOH SAHAJA — JANGAN BUAT BAYARAN' : 'Imbas DuitNow QR atau pindahan bank',
    h(
      'div',
      { flexDirection: 'column', alignItems: 'center' },
      h(
        'div',
        {
          padding: 12,
          background: '#ffffff',
          border: `3px solid ${c.border}`,
          borderRadius: 16,
          marginTop: 8,
        },
        img(d.qrDataUrl, qr, qr),
      ),
      h(
        'div',
        { fontSize: 40, fontWeight: 700, marginTop: 16, textAlign: 'center' },
        clip(d.accountName, 42),
      ),
      h('div', { fontSize: 36, color: c.textMuted }, d.bank),
      h('div', { fontSize: 52, fontWeight: 700, letterSpacing: 3 }, d.accountNumber),
      h(
        'div',
        {
          fontSize: 32,
          background: c.postponedBg,
          color: c.postponedText,
          padding: '12px 20px',
          borderRadius: 12,
          marginTop: 12,
          textAlign: 'center',
        },
        `Pastikan nama penerima ialah ${clip(d.accountName, 40)} sebelum mengesahkan.`,
      ),
    ),
  );
}
