// JSON-LD structured data (plan 6.3, D-63). Typed with schema-dts so property names are checked.
import type {
  BreadcrumbList,
  Event,
  EventSeries,
  EventStatusType,
  FAQPage,
  Graph,
  LodgingBusiness,
  Mosque,
  PostalAddress,
  Service,
  Thing,
  WebSite,
} from 'schema-dts';
import siteConfig from '../../../../config/site.json';
import type { Perkhidmatan, Settings } from './sanity.ts';
import { speakerPhoto } from './speaker.ts';
import type { Aktiviti, Masa, Speaker } from './types.ts';

const NAME = 'Masjid Al-Ihsan Felda Sungai Panching Selatan';
export const mosqueId = (site: URL) => new URL('/#masjid', site).href;

function postalAddress(settings: Settings): PostalAddress {
  const a = siteConfig.address;
  return {
    '@type': 'PostalAddress',
    ...(settings.address ? { streetAddress: settings.address.replace(/\s*\n\s*/g, ', ') } : {}),
    addressLocality: a.locality,
    addressRegion: a.region,
    addressCountry: a.country,
    ...(a.postalCode ? { postalCode: a.postalCode } : {}),
  };
}

export function mosque(settings: Settings, site: URL): Mosque {
  const sameAs = [settings.facebook].filter((x): x is string => Boolean(x));
  return {
    '@type': 'Mosque',
    '@id': mosqueId(site),
    name: settings.officialName?.replace(/^CONTOH\s*—\s*/, '') || NAME,
    url: new URL('/', site).href,
    image: new URL('/og-default.png', site).href,
    address: postalAddress(settings),
    ...(settings.phone ? { telephone: settings.phone.replace(/\s*\(CONTOH\)/, '') } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.mapUrl ? { hasMap: settings.mapUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export const website = (site: URL): WebSite => ({
  '@type': 'WebSite',
  '@id': new URL('/#laman', site).href,
  name: 'Masjid Al-Ihsan',
  url: new URL('/', site).href,
  inLanguage: 'ms-MY',
  publisher: { '@id': mosqueId(site) },
});

export function breadcrumbs(site: URL, trail: [name: string, path: string][]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [['Utama', '/'] as [string, string], ...trail].map(([name, path], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item: new URL(path, site).href,
    })),
  };
}

/** Clock time → "2026-10-24T08:30:00+08:00"; prayer-relative → date only (exact time varies). */
function when(date: string, masa: Masa, which: 'start' | 'end' = 'start'): string {
  const time = which === 'start' ? (masa.jenis === 'jam' ? masa.jam : undefined) : masa.jamTamat;
  return time ? `${date}T${time}:00+08:00` : date;
}

const person = (s: Speaker) => {
  const image = speakerPhoto(s, 400, 'jpg');
  return { '@type': 'Person' as const, name: s.nama, ...(image ? { image } : {}) };
};

const STATUS: Record<string, EventStatusType> = {
  dijadualkan: 'https://schema.org/EventScheduled',
  dipinda: 'https://schema.org/EventScheduled',
  dibatalkan: 'https://schema.org/EventCancelled',
  ditangguhkan: 'https://schema.org/EventPostponed',
};

export function activityEvent(a: Aktiviti, settings: Settings, site: URL): Event {
  const rescheduled = a.status === 'ditangguhkan' && a.tarikhBaharu;
  const date = rescheduled ? a.tarikhBaharu! : a.tarikhMula;
  const end = a.tarikhTamat && !rescheduled ? a.tarikhTamat : date;
  return {
    '@type': 'Event',
    name: a.tajuk,
    url: new URL(`/aktiviti/${a.slug}`, site).href,
    startDate: when(date, a.masa),
    ...(a.masa.jamTamat || end !== date ? { endDate: when(end, a.masa, 'end') } : {}),
    ...(rescheduled ? { previousStartDate: when(a.tarikhMula, a.masa) } : {}),
    eventStatus: rescheduled ? 'https://schema.org/EventRescheduled' : STATUS[a.status],
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: `${a.tempat}, ${NAME}`, address: postalAddress(settings) },
    organizer: { '@id': mosqueId(site) },
    isAccessibleForFree: true,
    inLanguage: 'ms-MY',
    image: new URL(`/gambar/aktiviti/${a.slug}/og.png`, site).href,
    ...(a.penerangan ? { description: a.penerangan } : {}),
    ...(a.penceramah ? { performer: person(a.penceramah) } : {}),
  };
}

/** A kuliah series with its upcoming dates as sub-events. */
export function kuliahSeries(
  name: string,
  path: string,
  description: string,
  occurrences: { date: string; masa: Masa; status: string; place: string; speaker?: Speaker }[],
  settings: Settings,
  site: URL,
): EventSeries {
  return {
    '@type': 'EventSeries',
    name,
    url: new URL(path, site).href,
    description,
    organizer: { '@id': mosqueId(site) },
    location: { '@type': 'Place', name: NAME, address: postalAddress(settings) },
    subEvent: occurrences.map((o) => {
      return {
        '@type': 'Event',
        name,
        startDate: when(o.date, o.masa),
        eventStatus: STATUS[o.status] ?? STATUS.dijadualkan,
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        location: { '@type': 'Place', name: `${o.place}, ${NAME}`, address: postalAddress(settings) },
        organizer: { '@id': mosqueId(site) },
        isAccessibleForFree: true,
        ...(o.speaker ? { performer: person(o.speaker) } : {}),
      } satisfies Event;
    }),
  };
}

export function service(s: Perkhidmatan, settings: Settings, site: URL): Service | LodgingBusiness {
  const url = new URL(`/khidmat/${s.slug}`, site).href;
  const image = s.gambar?.[0]?.url ?? new URL(`/gambar/khidmat/${s.slug}/og.png`, site).href;
  const price =
    s.kadar?.jumlah != null && (s.kadar.cara === 'tepat' || s.kadar.cara === 'bermula')
      ? {
          offers: {
            '@type': 'Offer' as const,
            priceCurrency: 'MYR',
            ...(s.kadar.cara === 'tepat'
              ? { price: s.kadar.jumlah }
              : {
                  priceSpecification: {
                    '@type': 'PriceSpecification' as const,
                    minPrice: s.kadar.jumlah,
                    priceCurrency: 'MYR',
                  },
                }),
          },
        }
      : {};
  // Homestay is a place to stay inside the mosque grounds (plan 6.3); everything else is a Service
  if (s.slug.includes('homestay')) {
    return {
      '@type': 'LodgingBusiness',
      name: `${s.nama} Masjid Al-Ihsan`,
      url,
      image,
      description: s.ringkasan,
      address: postalAddress(settings), // required by Google for LocalBusiness types
      containedInPlace: { '@id': mosqueId(site) },
      ...(s.kemudahan?.length
        ? {
            amenityFeature: s.kemudahan.map((k) => ({
              '@type': 'LocationFeatureSpecification' as const,
              name: k,
              value: true,
            })),
          }
        : {}),
      ...price,
    };
  }
  return {
    '@type': 'Service',
    name: `${s.nama} Masjid Al-Ihsan`,
    serviceType: s.nama,
    url,
    image,
    description: s.ringkasan,
    provider: { '@id': mosqueId(site) },
    areaServed: [
      { '@type': 'City', name: 'Kuantan' },
      { '@type': 'State', name: 'Pahang' },
    ],
    ...price,
  };
}

export function faq(items: { soalan: string; jawapan: string }[]): FAQPage {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((q) => ({
      '@type': 'Question',
      name: q.soalan,
      acceptedAnswer: { '@type': 'Answer', text: q.jawapan },
    })),
  };
}

/** One <script type="application/ld+json"> payload; "<" escaped so content can't close the tag. */
export function jsonLd(nodes: Thing[]): string {
  const graph: Graph = { '@context': 'https://schema.org', '@graph': nodes as Graph['@graph'] };
  return JSON.stringify(graph).replace(/</g, '\\u003c');
}
