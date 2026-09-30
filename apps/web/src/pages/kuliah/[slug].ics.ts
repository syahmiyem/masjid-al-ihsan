// /kuliah/<slug>.ics — a repeating calendar entry for a kuliah series, with cancelled dates excluded.
import type { APIRoute, GetStaticPaths } from 'astro';
import { addDays } from '../../lib/dates';
import { buildIcs, kuliahRrule } from '../../lib/ics';
import { expandKuliah } from '../../lib/kuliah';
import { getKuliahPerubahan, getKuliahSiri } from '../../lib/sanity';
import { calendarLocation } from '../../lib/share';
import type { KuliahSiri } from '../../lib/types';

export const getStaticPaths: GetStaticPaths = async () =>
  (await getKuliahSiri()).map((s) => ({ params: { slug: s.slug }, props: { siri: s } }));

export const GET: APIRoute = async ({ props, site }) => {
  const s = props.siri as KuliahSiri;
  const perubahan = await getKuliahPerubahan();
  const exdates = perubahan
    .filter((c) => c.siri === s._id && (c.jenis === 'dibatalkan' || c.jenis === 'ditangguhkan'))
    .map((c) => c.tarikh);
  // DTSTART must be the first real occurrence, or calendar apps add a stray entry on aktifDari
  const first = expandKuliah([s], [], s.aktifDari, addDays(s.aktifDari, 62))[0]?.date ?? s.aktifDari;
  const body = buildIcs({
    uid: `${s._id}@masjid-al-ihsan`,
    title: s.nama,
    date: first,
    masa: s.masa,
    location: calendarLocation(s.tempat),
    description: [s.penceramah && `Penceramah: ${s.penceramah}`, s.topik].filter(Boolean).join('\n'),
    url: new URL(`/kuliah/${s.slug}`, site).href,
    rrule: kuliahRrule(s),
    exdates,
  });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
