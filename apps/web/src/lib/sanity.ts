// Build-time content from Sanity (plan 9.1). Pages are static, so nothing here runs in visitors' browsers.
// Published content only, archived items excluded (plan 7.5); enquiries (private "pertanyaan." IDs) are
// never readable without a token.
import { createClient } from '@sanity/client';
import type { Aktiviti, KuliahPerubahan, KuliahSiri } from './types.ts';

export const client = createClient({
  projectId: process.env.SANITY_PROJECT_ID || '1xd617ey',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-02-19',
  useCdn: false, // builds must see content the moment it's published (the webhook triggered the build)
  perspective: 'published',
});

const memo = new Map<string, Promise<unknown>>();
function cached<T>(key: string, query: string, params: Record<string, unknown> = {}): Promise<T> {
  if (!memo.has(key)) memo.set(key, client.fetch<T>(query, params));
  return memo.get(key) as Promise<T>;
}

export type Settings = {
  officialName?: string;
  address?: string;
  mapUrl?: string;
  phone?: string;
  whatsapp?: string;
  officeHours?: string;
  email?: string;
  facebook?: string;
  sesiOrganisasi?: string;
};

export type Perkhidmatan = {
  _id: string;
  nama: string;
  slug: string;
  ringkasan: string;
  gambar?: { alt: string; url: string; width: number; height: number }[];
  penerangan?: {
    _key: string;
    style?: string;
    listItem?: string;
    children: { text: string; marks?: string[] }[];
  }[];
  kemudahan?: string[];
  kapasiti?: string;
  kadar?: { cara?: 'tepat' | 'bermula' | 'hubungi'; jumlah?: number; nota?: string };
  syarat?: string[];
  caraTempah?: string[];
  hubungi?: string;
  whatsapp?: string;
  soalanLazim?: { _key: string; soalan: string; jawapan: string }[];
};

export type Jawatan = {
  _id: string;
  jawatan: string;
  kumpulan: 'penaung' | 'pengurusan-utama' | 'pegawai-masjid' | 'ajk-biro';
  biro?: string;
  kosong?: boolean;
  nama?: string;
  susunan: number;
  gambar?: { alt: string; url: string };
};

export type Notis = { _id: string; mesej: string; tahap: 'makluman' | 'penting'; pautan?: string };

export const getSettings = () =>
  cached<Settings | null>('settings', '*[_id == "siteSettings"][0]').then((s) => s ?? {});

export const getAktiviti = () =>
  cached<Aktiviti[]>(
    'aktiviti',
    `*[_type == "aktiviti" && defined(slug.current) && diarkibkan != true] | order(tarikhMula asc) {
      _id, tajuk, "slug": slug.current, tarikhMula, tarikhTamat, masa, "tempat": tempat->nama,
      kategori, sasaran, penceramah, penerangan, status, tarikhBaharu, notaPerubahan
    }`,
  );

export const getKuliahSiri = () =>
  cached<KuliahSiri[]>(
    'kuliahSiri',
    `*[_type == "kuliahSiri" && defined(slug.current) && diarkibkan != true] | order(nama asc) {
      _id, nama, "slug": slug.current, jenis, hari, mingguKe, masa, "tempat": tempat->nama,
      penceramah, topik, sasaran, aktifDari, aktifHingga, penerangan
    }`,
  );

export const getKuliahPerubahan = () =>
  cached<KuliahPerubahan[]>(
    'kuliahPerubahan',
    `*[_type == "kuliahPerubahan" && diarkibkan != true] {
      _id, "siri": siri._ref, tarikh, jenis, tarikhBaharu, penceramahJemputan,
      "tempatBaharu": tempatBaharu->nama, masaBaharu, sebab
    }`,
  );

export const getPerkhidmatan = () =>
  cached<Perkhidmatan[]>(
    'perkhidmatan',
    `*[_type == "perkhidmatan" && defined(slug.current) && diarkibkan != true] | order(susunan asc, nama asc) {
      _id, nama, "slug": slug.current, ringkasan,
      "gambar": gambar[]{ alt, "url": asset->url, "width": asset->metadata.dimensions.width,
                          "height": asset->metadata.dimensions.height },
      penerangan, kemudahan, kapasiti, kadar, syarat, caraTempah, hubungi, whatsapp, soalanLazim
    }`,
  );

export const getJawatan = () =>
  cached<Jawatan[]>(
    'jawatan',
    `*[_type == "jawatan" && diarkibkan != true] | order(susunan asc) {
      _id, jawatan, kumpulan, biro, kosong, nama, susunan,
      "gambar": select(kebenaranGambar == true => gambar{ alt, "url": asset->url })
    }`,
  );

/** Notices active at build time. The nightly rebuild removes expired ones (plan 7.4). */
export const getNotis = (nowIso: string) =>
  cached<Notis[]>(
    `notis-${nowIso.slice(0, 13)}`,
    `*[_type == "notis" && diarkibkan != true && paparDari <= $now && paparHingga > $now] | order(tahap desc, paparDari desc) {
      _id, mesej, tahap, pautan
    }`,
    { now: nowIso },
  );
