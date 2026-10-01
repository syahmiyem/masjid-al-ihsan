// Loads fictional "CONTOH" sample content for the UAT demo (docs/plan.md Phase 1, D-09).
// Every document ID starts with "contoh-", so scripts/buang-contoh.ts can remove it all in Phase 5.
//
//   pnpm contoh:isi                               → dataset from sanity.cli.ts (production)
//   SANITY_STUDIO_DATASET=latihan pnpm contoh:isi → practice dataset
//
// Re-running replaces the same documents (createOrReplace), so it is safe to run more than once.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCliClient } from 'sanity/cli';

const client = getCliClient({ apiVersion: '2025-02-19' });

// Speakers (D-58). Two get a placeholder silhouette (no real faces) to show photos on the site and in
// share images; the others show the initials fallback.
const upload = async (file: string) =>
  (
    await client.assets.upload('image', readFileSync(join(import.meta.dirname, 'contoh-assets', file)), {
      filename: file,
    })
  )._id;
const photo = async (file: string, alt: string) => ({
  _type: 'gambar',
  alt,
  asset: { _type: 'reference', _ref: await upload(file) },
});
const penceramah = [
  {
    _id: 'contoh-penceramah-satu',
    _type: 'penceramah',
    nama: 'Ustaz Contoh Satu',
    keterangan: 'CONTOH: Imam Masjid Al-Ihsan',
    gambar: await photo('penceramah-1.png', 'Gambar contoh (siluet) Ustaz Contoh Satu'),
    kebenaranGambar: true,
  },
  {
    _id: 'contoh-penceramah-dua',
    _type: 'penceramah',
    nama: 'Ustaz Contoh Dua',
    keterangan: 'CONTOH: Penceramah jemputan tetap',
    gambar: await photo('penceramah-2.png', 'Gambar contoh (siluet) Ustaz Contoh Dua'),
    kebenaranGambar: true,
  },
  { _id: 'contoh-penceramah-tiga', _type: 'penceramah', nama: 'Ustaz Contoh Tiga' },
  { _id: 'contoh-penceramah-empat', _type: 'penceramah', nama: 'Ustazah Contoh Empat' },
  { _id: 'contoh-penceramah-jemputan', _type: 'penceramah', nama: 'Ustaz Contoh Jemputan' },
];
const ref = (id: string) => ({ _type: 'reference', _ref: id });
const key = (i: number) => `k${i}`;
const blocks = (...paras: string[]) =>
  paras.map((text, i) => ({
    _type: 'block',
    _key: key(i),
    style: 'normal',
    markDefs: [],
    children: [{ _type: 'span', _key: `s${i}`, text, marks: [] }],
  }));
const list = (...items: string[]) => items;

const tempat = [
  ['contoh-tempat-dewan-solat', 'Dewan Solat Utama'],
  ['contoh-tempat-dewan-serbaguna', 'Dewan Serbaguna'],
  ['contoh-tempat-bilik-kuliah', 'Bilik Kuliah'],
  ['contoh-tempat-kawasan', 'Kawasan masjid'],
].map(([_id, nama]) => ({ _id, _type: 'tempat', nama }));

const siri = [
  {
    _id: 'contoh-kuliah-maghrib',
    nama: 'Kuliah Maghrib Mingguan (CONTOH)',
    slug: 'kuliah-maghrib-mingguan',
    jenis: 'mingguan',
    hari: 'isnin',
    masa: { _type: 'masa', jenis: 'solat', waktuSolat: 'selepas-maghrib' },
    tempat: 'contoh-tempat-dewan-solat',
    penceramah: ref('contoh-penceramah-satu'),
    topik: 'CONTOH: Kitab Riyadhus Solihin',
  },
  {
    _id: 'contoh-kuliah-subuh',
    nama: 'Kuliah Subuh Ahad (CONTOH)',
    slug: 'kuliah-subuh-ahad',
    jenis: 'mingguan',
    hari: 'ahad',
    masa: { _type: 'masa', jenis: 'solat', waktuSolat: 'selepas-subuh' },
    tempat: 'contoh-tempat-dewan-solat',
    penceramah: ref('contoh-penceramah-dua'),
    topik: 'CONTOH: Tafsir Juzuk Amma',
  },
  {
    _id: 'contoh-kelas-tajwid',
    nama: 'Kelas Tajwid Dewasa (CONTOH)',
    slug: 'kelas-tajwid-dewasa',
    jenis: 'mingguan',
    hari: 'khamis',
    masa: { _type: 'masa', jenis: 'solat', waktuSolat: 'selepas-isyak' },
    tempat: 'contoh-tempat-bilik-kuliah',
    penceramah: ref('contoh-penceramah-tiga'),
  },
  {
    _id: 'contoh-kuliah-muslimah',
    nama: 'Kuliah Dhuha Muslimah (CONTOH)',
    slug: 'kuliah-dhuha-muslimah',
    jenis: 'bulanan',
    hari: 'rabu',
    mingguKe: '1',
    masa: { _type: 'masa', jenis: 'jam', jam: '10:00', jamTamat: '11:30' },
    tempat: 'contoh-tempat-dewan-serbaguna',
    penceramah: ref('contoh-penceramah-empat'),
    sasaran: 'muslimah',
  },
].map(({ slug, tempat, ...rest }) => ({
  _type: 'kuliahSiri',
  sasaran: 'umum',
  aktifDari: '2026-10-01',
  ...rest,
  slug: { _type: 'slug', current: slug },
  tempat: ref(tempat),
}));

const perubahan = [
  {
    _id: 'contoh-perubahan-1',
    _type: 'kuliahPerubahan',
    siri: ref('contoh-kuliah-maghrib'),
    tarikh: '2026-10-12',
    jenis: 'dibatalkan',
    sebab: 'CONTOH: Penceramah uzur.',
  },
  {
    _id: 'contoh-perubahan-2',
    _type: 'kuliahPerubahan',
    siri: ref('contoh-kuliah-subuh'),
    tarikh: '2026-10-18',
    jenis: 'penceramah-jemputan',
    penceramahJemputan: ref('contoh-penceramah-jemputan'),
  },
];

const aktiviti = [
  {
    _id: 'contoh-aktiviti-gotong-royong',
    tajuk: 'Gotong-royong Perdana (CONTOH)',
    slug: 'gotong-royong-perdana-oktober-2026',
    tarikhMula: '2026-10-10',
    masa: { _type: 'masa', jenis: 'jam', jam: '08:00', jamTamat: '11:00' },
    tempat: 'contoh-tempat-kawasan',
    kategori: 'gotong-royong',
    penerangan: 'CONTOH: Membersihkan kawasan masjid. Sarapan disediakan.',
    status: 'ditangguhkan',
    tarikhBaharu: '2026-10-17',
    notaPerubahan: 'CONTOH: Ditangguhkan kerana ramalan hujan lebat.',
  },
  {
    _id: 'contoh-aktiviti-yasin',
    tajuk: 'Bacaan Yasin dan Tahlil (CONTOH)',
    slug: 'bacaan-yasin-tahlil-oktober-2026',
    tarikhMula: '2026-10-15',
    masa: { _type: 'masa', jenis: 'solat', waktuSolat: 'selepas-maghrib' },
    tempat: 'contoh-tempat-dewan-solat',
    kategori: 'program-khas',
  },
  {
    _id: 'contoh-aktiviti-jenazah',
    tajuk: 'Kursus Pengurusan Jenazah (CONTOH)',
    slug: 'kursus-pengurusan-jenazah-2026',
    tarikhMula: '2026-10-24',
    masa: { _type: 'masa', jenis: 'jam', jam: '08:30', jamTamat: '13:00' },
    tempat: 'contoh-tempat-dewan-serbaguna',
    kategori: 'program-khas',
    penganjur: 'CONTOH: Unit Pengurusan Jenazah',
    penerangan: 'CONTOH: Teori dan amali. Terbuka kepada lelaki dan wanita.',
  },
  {
    _id: 'contoh-aktiviti-fardu-ain',
    tajuk: 'Kelas Fardu Ain Kanak-kanak (CONTOH)',
    slug: 'kelas-fardu-ain-kanak-kanak-november-2026',
    tarikhMula: '2026-11-07',
    masa: { _type: 'masa', jenis: 'jam', jam: '09:00', jamTamat: '11:00' },
    tempat: 'contoh-tempat-bilik-kuliah',
    kategori: 'kelas',
    sasaran: 'kanak-kanak',
  },
  {
    _id: 'contoh-aktiviti-mesyuarat',
    tajuk: 'Mesyuarat AJK Bulanan (CONTOH)',
    slug: 'mesyuarat-ajk-november-2026',
    tarikhMula: '2026-11-05',
    masa: { _type: 'masa', jenis: 'solat', waktuSolat: 'selepas-isyak' },
    tempat: 'contoh-tempat-bilik-kuliah',
    kategori: 'mesyuarat',
  },
].map(({ slug, tempat, ...rest }) => ({
  _type: 'aktiviti',
  sasaran: 'umum',
  status: 'dijadualkan',
  ...rest,
  slug: { _type: 'slug', current: slug },
  tempat: ref(tempat),
}));

const faq = (...pairs: [string, string][]) =>
  pairs.map(([soalan, jawapan], i) => ({ _type: 'soalan', _key: key(i), soalan, jawapan }));

const perkhidmatan = [
  {
    _id: 'contoh-perkhidmatan-akad-nikah',
    nama: 'Dewan Akad Nikah',
    slug: 'dewan-akad-nikah',
    susunan: 1,
    ringkasan: 'CONTOH: Dewan berhawa dingin untuk majlis akad nikah di Felda Sg Panching Selatan, Kuantan.',
    penerangan: blocks(
      'CONTOH: Dewan akad nikah Masjid Al-Ihsan sesuai untuk majlis akad nikah yang ringkas dan selesa.',
      'CONTOH: Pihak masjid boleh membantu menyelaras jurunikah dan saksi. Sila hubungi kami untuk tarikh.',
    ),
    kemudahan: list('Penghawa dingin', 'Sistem PA', 'Kerusi untuk 50 orang', 'Tempat letak kereta'),
    kapasiti: 'CONTOH: Sehingga 50 orang',
    syarat: list('CONTOH: Berpakaian menutup aurat', 'CONTOH: Tempahan sekurang-kurangnya 2 minggu awal'),
    caraTempah: list(
      'Tanya tarikh melalui WhatsApp',
      'Pihak masjid mengesahkan tarikh',
      'Lengkapkan borang dan dokumen',
    ),
    hubungi: 'Pengurus Dewan',
    soalanLazim: faq(
      [
        'CONTOH: Berapa awal saya perlu menempah?',
        'CONTOH: Sekurang-kurangnya 2 minggu sebelum tarikh majlis.',
      ],
      ['CONTOH: Adakah jurunikah disediakan?', 'CONTOH: Pihak masjid boleh membantu menyelaras.'],
      ['CONTOH: Bolehkah saya melihat dewan dahulu?', 'CONTOH: Boleh, sila hubungi kami untuk temu janji.'],
    ),
  },
  {
    _id: 'contoh-perkhidmatan-serbaguna',
    nama: 'Dewan Serbaguna',
    slug: 'dewan-serbaguna',
    susunan: 2,
    ringkasan: 'CONTOH: Dewan untuk kenduri, mesyuarat dan program komuniti di Kuantan.',
    penerangan: blocks('CONTOH: Dewan serbaguna yang luas untuk pelbagai majlis dan program.'),
    kemudahan: list('Kipas', 'Sistem PA', 'Meja dan kerusi', 'Dapur'),
    kapasiti: 'CONTOH: Sehingga 200 orang',
    caraTempah: list('Tanya tarikh melalui WhatsApp', 'Pihak masjid mengesahkan tarikh'),
    hubungi: 'Pengurus Dewan',
    soalanLazim: faq(
      ['CONTOH: Adakah dapur boleh digunakan?', 'CONTOH: Boleh, tertakluk kepada syarat kebersihan.'],
      ['CONTOH: Adakah meja dan kerusi disediakan?', 'CONTOH: Ya, termasuk dalam tempahan.'],
      ['CONTOH: Bolehkah saya menempah untuk hari bekerja?', 'CONTOH: Boleh, sila tanya tarikh.'],
    ),
  },
  {
    _id: 'contoh-perkhidmatan-homestay',
    nama: 'Homestay',
    slug: 'homestay',
    susunan: 3,
    ringkasan: 'CONTOH: Penginapan untuk keluarga dan kumpulan berhampiran Sungai Panching, Kuantan.',
    penerangan: blocks(
      'CONTOH: Homestay masjid sesuai untuk keluarga dan kumpulan yang berkunjung ke Kuantan.',
    ),
    kemudahan: list('CONTOH: 3 bilik tidur', 'Penghawa dingin', 'Dapur', 'Tempat letak kereta'),
    kapasiti: 'CONTOH: Sehingga 10 orang',
    caraTempah: list('Tanya tarikh melalui WhatsApp', 'Pihak masjid mengesahkan tarikh dan kadar'),
    hubungi: 'Pengurus Homestay',
    soalanLazim: faq(
      ['CONTOH: Pukul berapa daftar masuk?', 'CONTOH: 3:00 petang. Daftar keluar 12:00 tengah hari.'],
      ['CONTOH: Sesuai untuk kumpulan besar?', 'CONTOH: Sehingga 10 orang.'],
      ['CONTOH: Adakah dekat dengan masjid?', 'CONTOH: Ya, dalam kawasan masjid.'],
    ),
  },
].map(({ slug, ...rest }) => ({
  _type: 'perkhidmatan',
  kadar: { cara: 'hubungi' },
  ...rest,
  slug: { _type: 'slug', current: slug },
}));

const jawatan = [
  ['penaung', 'Penaung', 'CONTOH Nama Penaung', 1],
  ['pengerusi', 'Pengerusi', 'CONTOH Nama Satu', 1],
  ['timbalan', 'Timbalan Pengerusi', 'CONTOH Nama Dua', 2],
  ['setiausaha', 'Setiausaha', 'CONTOH Nama Tiga', 3],
  ['bendahari', 'Bendahari', null, 4],
  ['imam', 'Imam', 'CONTOH Nama Empat', 1],
  ['bilal', 'Bilal', 'CONTOH Nama Lima', 2],
  ['siak', 'Siak', 'CONTOH Nama Enam', 3],
  ['biro-dakwah', 'AJK Biro Dakwah', 'CONTOH Nama Tujuh', 1],
].map(([id, jawatanNama, nama, susunan]) => ({
  _id: `contoh-jawatan-${id}`,
  _type: 'jawatan',
  jawatan: jawatanNama,
  kumpulan:
    id === 'penaung'
      ? 'penaung'
      : ['imam', 'bilal', 'siak'].includes(id as string)
        ? 'pegawai-masjid'
        : id === 'biro-dakwah'
          ? 'ajk-biro'
          : 'pengurusan-utama',
  ...(nama ? { nama, kosong: false } : { kosong: true }),
  susunan,
}));

const now = new Date();
const notis = [
  {
    _id: 'contoh-notis-1',
    _type: 'notis',
    mesej: 'CONTOH: Kuliah Maghrib Isnin 12 Oktober dibatalkan.',
    tahap: 'penting',
    paparDari: now.toISOString(),
    paparHingga: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    pautan: '/kuliah',
  },
];

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  officialName: 'CONTOH — Masjid Al-Ihsan Felda Sungai Panching Selatan',
  address: 'CONTOH alamat\nFelda Sungai Panching Selatan\nKuantan, Pahang',
  phone: '09-000 0000 (CONTOH)',
  whatsapp: '60100000000',
  officeHours: 'CONTOH: Isnin hingga Jumaat, 9:00 pagi – 5:00 petang',
  sesiOrganisasi: 'Sesi 2026/2027 (CONTOH)',
};

type Doc = { _id: string; _type: string; [field: string]: unknown };
const docs: Doc[] = [
  ...penceramah,
  ...tempat,
  ...siri,
  ...perubahan,
  ...aktiviti,
  ...perkhidmatan,
  ...jawatan,
  ...notis,
  siteSettings,
];
const tx = client.transaction();
for (const doc of docs) tx.createOrReplace(doc);
await tx.commit({ visibility: 'async' });
console.log(`Dataset "${client.config().dataset}": ${docs.length} CONTOH documents written.`);
