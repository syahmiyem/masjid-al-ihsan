// Every shareable image on the site (plan 4.4, D-30/D-31), keyed by the page it belongs to.
// Used by pages/gambar/[...path].png.ts (to generate the PNGs) and by SaveImage.astro (to list them).
import dermaConfig from '../../../../config/derma/derma.json';
import siteConfig from '../../../../config/site.json';
import { calendarItems, calendarMonths, type CalendarItem } from '../lib/calendar.ts';
import { addDays, monthBounds } from '../lib/dates.ts';
import { groupDigits, type DermaConfig } from '../lib/derma.ts';
import {
  dayName,
  formatDate,
  formatDateShort,
  formatHijri,
  formatTime,
  lowerFirst,
  monthName,
} from '../lib/format.ts';
import { ruleLabel } from '../lib/kuliah.ts';
import { masaLabel, masaLabelShort } from '../lib/masa.ts';
import { getJawatan, getPerkhidmatan, getSettings } from '../lib/sanity.ts';
import { calendarSources, today } from '../lib/site.ts';
import { initials, speakerPhoto } from '../lib/speaker.ts';
import type { Speaker } from '../lib/types.ts';
import { prayerLabel } from '../lib/waktu-solat.ts';
import { prayerDay, prayerDaysOfMonth, prayerMonths, prayerZone } from '../lib/waktu-solat-data.ts';
import { FORMATS, type FormatKey, type FrameInfo } from './frame.ts';
import type { PosterNode } from './h.ts';
import {
  dermaPoster,
  itemPoster,
  listPosters,
  ogPoster,
  prayerMonthPosters,
  prayerTodayPoster,
  type Avatar,
  type ListBlock,
} from './templates.ts';

export type Poster = {
  /** Public path, e.g. /gambar/aktiviti/2026-10/potret-1.png */
  path: string;
  /** Site page it belongs to, e.g. /aktiviti/2026-10 */
  page: string;
  format: FormatKey;
  /** What the image shows, e.g. "Waktu Solat Hari Ini" — shown in the Simpan Gambar panel */
  title: string;
  part: number;
  parts: number;
  node: PosterNode;
};

const uat = (process.env.UAT_MODE ?? 'true').toLowerCase() !== 'false';
const host = new URL(process.env.SITE_URL || 'http://localhost:4321').host;
const SHARE: FormatKey[] = ['potret', 'status'];
const SHORT_DAY: Record<string, string> = {
  Ahad: 'Ahd',
  Isnin: 'Isn',
  Selasa: 'Sel',
  Rabu: 'Rab',
  Khamis: 'Kha',
  Jumaat: 'Jum',
  Sabtu: 'Sab',
};
const STATUS_TEXT: Record<string, string> = {
  dibatalkan: 'DIBATALKAN',
  ditangguhkan: 'DITANGGUHKAN',
  dipinda: 'DIPINDA',
};

function add(
  out: Poster[],
  page: string,
  key: string,
  format: FormatKey,
  nodes: PosterNode[],
  title: string,
) {
  nodes.forEach((node, i) =>
    out.push({
      path: `/gambar/${key}/${format}${nodes.length > 1 ? `-${i + 1}` : ''}.png`,
      page,
      format,
      title,
      part: i + 1,
      parts: nodes.length,
      node,
    }),
  );
}

// Speaker photos are fetched once per build from Sanity's image CDN (already cropped square) and embedded
// as data URLs, because Satori can't load remote images reliably. Any failure falls back to initials.
const avatars = new Map<string, Avatar>();
async function loadAvatar(s: Speaker | undefined): Promise<void> {
  if (!s || avatars.has(s.nama)) return;
  const url = speakerPhoto(s, 240, 'jpg');
  let src: string | undefined;
  if (url) {
    try {
      const res = await fetch(url);
      if (res.ok) src = `data:image/jpeg;base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`;
    } catch {
      /* initials fallback */
    }
  }
  avatars.set(s.nama, { src, initials: initials(s.nama) });
}
const avatarOf = (s?: Speaker) => (s ? avatars.get(s.nama) : undefined);

/** Calendar items → rows, with the date block only on the first row of each day. */
function eventBlocks(items: CalendarItem[], withHeadings = false): ListBlock[] {
  const blocks: ListBlock[] = [];
  let lastDate = '';
  for (const i of items) {
    const first = i.date !== lastDate;
    if (first && withHeadings) blocks.push({ kind: 'heading', text: formatDate(i.date) });
    blocks.push({
      kind: 'row',
      row: {
        dayShort: first && !withHeadings ? SHORT_DAY[dayName(i.date)] : undefined,
        dayNum: first && !withHeadings ? Number(i.date.slice(8)) : undefined,
        title: i.title.replace(' (CONTOH)', ''),
        meta:
          i.status === 'ditangguhkan' && i.note?.match(/ke (.+?)\./)
            ? `ke ${i.note.match(/ke (.+?)\./)![1]}`
            : [i.timePlain, i.place].filter(Boolean).join(' · '),
        status: i.status === 'berlangsung' || i.status === 'dijadualkan' ? undefined : i.status,
        statusText: i.label ?? STATUS_TEXT[i.status],
        wide: withHeadings,
        extra: withHeadings ? i.speaker?.nama : undefined,
        avatar: withHeadings ? avatarOf(i.speaker) : undefined,
      },
    });
    lastDate = i.date;
  }
  return blocks;
}

let cache: Promise<Poster[]> | undefined;

export function catalogue(): Promise<Poster[]> {
  cache ??= build();
  return cache;
}

export async function postersFor(page: string): Promise<Omit<Poster, 'node'>[]> {
  return (await catalogue())
    .filter((p) => p.page === page && p.format !== 'og')
    .map(({ node, ...rest }) => rest);
}

export async function ogFor(page: string): Promise<string | undefined> {
  return (await catalogue()).find((p) => p.page === page && p.format === 'og')?.path;
}

async function build(): Promise<Poster[]> {
  const now = today();
  const info: FrameInfo = { uat, host, updated: formatDateShort(now.date) };
  const src = await calendarSources();
  await Promise.all(
    [
      ...src.siri.map((s) => s.penceramah),
      ...src.aktiviti.map((a) => a.penceramah),
      ...src.perubahan.map((c) => c.penceramahJemputan),
    ].map(loadAvatar),
  );
  const [services, jawatan, settings] = await Promise.all([getPerkhidmatan(), getJawatan(), getSettings()]);
  const out: Poster[] = [];

  // Home: "Minggu Ini"
  const week = calendarItems(now.date, addDays(now.date, 6), src).filter((i) => i.status !== 'berlangsung');
  for (const f of SHARE) {
    add(
      out,
      '/',
      'minggu-ini',
      f,
      listPosters(
        f,
        info,
        'Minggu Ini di Masjid',
        `${formatDateShort(now.date)} – ${formatDateShort(addDays(now.date, 6))}`,
        eventBlocks(week, true),
      ),
      'Minggu Ini di Masjid',
    );
  }

  // Monthly calendars
  const months = calendarMonths(
    now.date,
    src.aktiviti.map((a) => a.tarikhMula),
  );
  for (const month of months) {
    const { first, last } = monthBounds(month);
    const items = calendarItems(first, last, src).map((i) => ({
      ...i,
      status: i.status === 'berlangsung' ? ('dijadualkan' as const) : i.status,
    }));
    const title = `Aktiviti ${monthName(Number(month.slice(5)))} ${month.slice(0, 4)}`;
    for (const f of SHARE)
      add(
        out,
        `/aktiviti/${month}`,
        `aktiviti/${month}`,
        f,
        listPosters(f, info, title, 'Kuliah dan program', eventBlocks(items)),
        title,
      );
  }
  // /aktiviti shows the current month
  for (const p of out.filter((p) => p.page === `/aktiviti/${now.date.slice(0, 7)}`))
    out.push({ ...p, page: '/aktiviti' });

  // Single activities
  for (const a of src.aktiviti) {
    const date = a.status === 'ditangguhkan' && a.tarikhBaharu ? a.tarikhBaharu : a.tarikhMula;
    const time = masaLabel(a.masa, prayerDay(date));
    const status =
      a.status === 'dijadualkan'
        ? undefined
        : {
            kind: a.status,
            text: STATUS_TEXT[a.status],
            note:
              a.status === 'ditangguhkan' && a.tarikhBaharu
                ? `Ditangguhkan ke ${formatDate(a.tarikhBaharu)}.`
                : a.notaPerubahan,
          };
    const item = {
      kicker: 'Aktiviti',
      title: a.tajuk,
      status,
      facts: [
        ['Tarikh', formatDate(date)],
        ['Masa', time],
        ['Tempat', a.tempat],
        ...(a.penganjur ? [['Penganjur', a.penganjur]] : []),
      ] as [string, string][],
      speaker: a.penceramah
        ? { name: a.penceramah.nama, role: a.penceramah.keterangan, avatar: avatarOf(a.penceramah)! }
        : undefined,
      description: a.penerangan,
      footerLine: 'Maklumat lanjut di laman web masjid',
    };
    for (const f of SHARE)
      add(out, `/aktiviti/${a.slug}`, `aktiviti/${a.slug}`, f, [itemPoster(f, info, item)], a.tajuk);
    add(
      out,
      `/aktiviti/${a.slug}`,
      `aktiviti/${a.slug}`,
      'og',
      [ogPoster(info, 'Aktiviti', a.tajuk, [formatDate(date), `${time} · ${a.tempat}`])],
      a.tajuk,
    );
  }

  // Weekly kuliah timetable (+ monthly series)
  const active = src.siri.filter((s) => !s.aktifHingga || s.aktifHingga >= now.date);
  const DAYS = ['isnin', 'selasa', 'rabu', 'khamis', 'jumaat', 'sabtu', 'ahad'] as const;
  const DAY_NAME = {
    isnin: 'Isnin',
    selasa: 'Selasa',
    rabu: 'Rabu',
    khamis: 'Khamis',
    jumaat: 'Jumaat',
    sabtu: 'Sabtu',
    ahad: 'Ahad',
  };
  const timetable: ListBlock[] = [];
  for (const d of DAYS) {
    const series = active.filter((s) => s.jenis === 'mingguan' && s.hari === d);
    if (!series.length) continue;
    timetable.push({ kind: 'heading', text: DAY_NAME[d] });
    for (const s of series) {
      timetable.push({
        kind: 'row',
        row: {
          title: s.nama.replace(' (CONTOH)', ''),
          meta: [masaLabelShort(s.masa), s.tempat].join(' · '),
          extra: s.penceramah?.nama,
          avatar: avatarOf(s.penceramah),
          wide: true,
        },
      });
    }
  }
  const monthly = active.filter((s) => s.jenis === 'bulanan');
  if (monthly.length) {
    timetable.push({ kind: 'heading', text: 'Kuliah Bulanan' });
    for (const s of monthly) {
      timetable.push({
        kind: 'row',
        row: {
          title: s.nama.replace(' (CONTOH)', ''),
          meta: `${ruleLabel(s)} · ${masaLabelShort(s.masa)}`,
          extra: s.penceramah?.nama,
          avatar: avatarOf(s.penceramah),
          wide: true,
        },
      });
    }
  }
  for (const f of SHARE)
    add(
      out,
      '/kuliah',
      'kuliah/jadual',
      f,
      listPosters(f, info, 'Jadual Kuliah', 'Mingguan dan bulanan', timetable),
      'Jadual Kuliah',
    );

  // Single kuliah series
  for (const s of src.siri) {
    const item = {
      kicker: s.jenis === 'mingguan' ? 'Kuliah Mingguan' : 'Kuliah Bulanan',
      title: s.nama,
      facts: [
        ['Bila', ruleLabel(s)],
        ['Masa', masaLabelShort(s.masa)],
        ['Tempat', s.tempat],
        ...(s.topik ? [['Topik / Kitab', s.topik]] : []),
      ] as [string, string][],
      speaker: s.penceramah
        ? { name: s.penceramah.nama, role: s.penceramah.keterangan, avatar: avatarOf(s.penceramah)! }
        : undefined,
      description: s.penerangan,
      footerLine: 'Tarikh terkini dan sebarang perubahan di laman web masjid',
    };
    for (const f of SHARE)
      add(out, `/kuliah/${s.slug}`, `kuliah/${s.slug}`, f, [itemPoster(f, info, item)], s.nama);
    add(
      out,
      `/kuliah/${s.slug}`,
      `kuliah/${s.slug}`,
      'og',
      [
        ogPoster(info, item.kicker, s.nama, [
          `${ruleLabel(s)}, ${lowerFirst(masaLabelShort(s.masa))}`,
          s.tempat,
        ]),
      ],
      s.nama,
    );
  }

  // Services
  for (const s of services) {
    const kadar =
      s.kadar?.cara === 'tepat' && s.kadar.jumlah != null
        ? `RM${s.kadar.jumlah}${s.kadar.nota ? ` ${s.kadar.nota}` : ''}`
        : s.kadar?.cara === 'bermula' && s.kadar.jumlah != null
          ? `Bermula dari RM${s.kadar.jumlah}`
          : 'Sila hubungi kami';
    const whatsapp = s.whatsapp || settings.whatsapp;
    const item = {
      kicker: 'Khidmat',
      title: s.nama,
      facts: [...(s.kapasiti ? [['Kapasiti', s.kapasiti]] : []), ['Kadar / Sumbangan', kadar]] as [
        string,
        string,
      ][],
      bullets: s.kemudahan,
      description: s.ringkasan,
      footerLine: whatsapp
        ? `Tanya tarikh: WhatsApp ${whatsapp.replace(/^60/, '0')}`
        : 'Maklumat lanjut di laman web masjid',
    };
    for (const f of SHARE)
      add(out, `/khidmat/${s.slug}`, `khidmat/${s.slug}`, f, [itemPoster(f, info, item)], s.nama);
    add(
      out,
      `/khidmat/${s.slug}`,
      `khidmat/${s.slug}`,
      'og',
      [ogPoster(info, 'Khidmat', s.nama, [s.ringkasan])],
      s.nama,
    );
  }

  // Waktu Solat: today + each month
  const zone = `Zon ${prayerZone} (${siteConfig.prayerZoneName})`;
  const prayerInfo = { ...info, source: 'Sumber: JAKIM (e-Solat)' };
  const todayData = prayerDay(now.date);
  if (todayData) {
    const rows: [string, string][] = [
      ['Imsak', formatTime(todayData.imsak)],
      ['Subuh', formatTime(todayData.subuh)],
      ['Syuruk', formatTime(todayData.syuruk)],
      [prayerLabel('zohor', now.date), formatTime(todayData.zohor)],
      ['Asar', formatTime(todayData.asar)],
      ['Maghrib', formatTime(todayData.maghrib)],
      ['Isyak', formatTime(todayData.isyak)],
    ];
    for (const f of SHARE) {
      add(
        out,
        '/waktu-solat',
        'waktu-solat/hari-ini',
        f,
        [prayerTodayPoster(f, prayerInfo, `${formatDate(now.date)} · ${formatHijri(todayData.hijri)}`, rows)],
        'Waktu Solat Hari Ini',
      );
    }
  }
  const short = (t: string) => formatTime(t).split(' ')[0];
  for (const month of prayerMonths()) {
    const rows = prayerDaysOfMonth(month).map((d) => ({
      day: `${Number(d.date.slice(8))} ${SHORT_DAY[dayName(d.date)]}`,
      times: [d.subuh, d.zohor, d.asar, d.maghrib, d.isyak].map(short),
      friday: dayName(d.date) === 'Jumaat',
    }));
    const title = `Waktu Solat ${monthName(Number(month.slice(5)))} ${month.slice(0, 4)}`;
    for (const f of SHARE) {
      const posters = prayerMonthPosters(f, prayerInfo, title, zone, rows);
      add(out, `/waktu-solat/${month}`, `waktu-solat/${month}`, f, posters, title);
      if (month === now.date.slice(0, 7)) add(out, '/waktu-solat', `waktu-solat/${month}`, f, posters, title);
    }
  }

  // Sumbangan (formerly Derma)
  const derma = dermaConfig as DermaConfig;
  const qrFiles = import.meta.glob<string>('../../../../config/derma/*.png', {
    query: '?inline',
    import: 'default',
    eager: true,
  });
  const qrDataUrl = Object.entries(qrFiles).find(([file]) => file.endsWith(`/${derma.qrImage}`))?.[1];
  if (!qrDataUrl) throw new Error(`config/derma/${derma.qrImage} not found`);
  for (const f of SHARE) {
    add(
      out,
      '/sumbangan',
      'sumbangan',
      f,
      [
        dermaPoster(f, info, {
          contoh: derma.status === 'contoh',
          qrDataUrl,
          accountName: derma.accountName,
          bank: derma.bank,
          accountNumber: groupDigits(derma.accountNumber),
        }),
      ],
      'Sumbangan untuk Masjid',
    );
  }

  // Carta Organisasi
  const GROUPS = [
    ['penaung', 'Penaung'],
    ['pengurusan-utama', 'Pengurusan Utama'],
    ['pegawai-masjid', 'Pegawai Masjid'],
    ['ajk-biro', 'AJK Biro'],
  ] as const;
  const org: ListBlock[] = [];
  for (const [key, label] of GROUPS) {
    const people = jawatan.filter((j) => j.kumpulan === key).sort((a, b) => a.susunan - b.susunan);
    if (!people.length) continue;
    org.push({ kind: 'heading', text: label });
    for (const p of people)
      org.push({
        kind: 'row',
        row: {
          title: p.kosong ? 'Jawatan kosong' : (p.nama ?? ''),
          meta: p.biro ? `${p.jawatan} (${p.biro})` : p.jawatan,
          wide: true,
        },
      });
  }
  for (const f of SHARE)
    add(
      out,
      '/tentang/organisasi',
      'organisasi',
      f,
      listPosters(f, info, 'Carta Organisasi', settings.sesiOrganisasi ?? '', org),
      'Carta Organisasi',
    );

  // Sanity check: every path unique
  const seen = new Set<string>();
  for (const p of out) {
    if (p.page === '/aktiviti' || (p.page === '/waktu-solat' && p.path.includes(now.date.slice(0, 7))))
      continue;
    if (seen.has(p.path)) throw new Error(`Duplicate poster path ${p.path}`);
    seen.add(p.path);
  }
  void FORMATS;
  return out;
}
