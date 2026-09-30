// /aktiviti/<slug>.ics — one activity for the phone's calendar (plan 4.1, D-33).
import type { APIRoute, GetStaticPaths } from 'astro';
import { buildIcs } from '../../lib/ics';
import { getAktiviti } from '../../lib/sanity';
import { calendarLocation } from '../../lib/share';
import type { Aktiviti } from '../../lib/types';

export const getStaticPaths: GetStaticPaths = async () =>
  (await getAktiviti()).map((a) => ({ params: { slug: a.slug }, props: { aktiviti: a } }));

export const GET: APIRoute = ({ props, site }) => {
  const a = props.aktiviti as Aktiviti;
  // A postponed activity's calendar entry uses the new date
  const date = a.status === 'ditangguhkan' && a.tarikhBaharu ? a.tarikhBaharu : a.tarikhMula;
  const body = buildIcs({
    uid: `${a._id}@masjid-al-ihsan`,
    title: a.status === 'dibatalkan' ? `DIBATALKAN: ${a.tajuk}` : a.tajuk,
    date,
    endDate: a.status === 'ditangguhkan' ? undefined : a.tarikhTamat,
    masa: a.masa,
    location: calendarLocation(a.tempat),
    description: a.penerangan,
    url: new URL(`/aktiviti/${a.slug}`, site).href,
  });
  return new Response(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8' } });
};
