import {
  defineArrayMember as e,
  defineConfig as t,
  defineField as n,
  defineType as r,
  renderStudio as i,
  useCurrentUser as a,
  useEditState as o,
  useFormValue as s,
} from 'sanity';
import { structureTool as c } from 'sanity/structure';
import { useState as l } from 'react';
import { jsx as u, jsxs as d } from 'react/jsx-runtime';
function f(e) {
  let t = String(s([`_id`]) ?? ``).replace(/^drafts\./, ``),
    n = String(s([`_type`]) ?? ``),
    { published: r } = o(t, n),
    i = r?.slug?.current,
    c = !!a()?.roles?.some((e) => e.name === `administrator`),
    [f, p] = l(!1);
  return !i || f
    ? e.renderDefault(e)
    : d(`div`, {
        style: { border: `1px solid var(--card-border-color, #ccc)`, borderRadius: 6, padding: 12 },
        children: [
          d(`p`, {
            style: { margin: 0, fontWeight: 600 },
            children: [u(`span`, { 'aria-hidden': `true`, children: `🔒 ` }), i],
          }),
          u(`p`, {
            style: { margin: `8px 0 0`, fontSize: 13, opacity: 0.8 },
            children: `Pautan ini dikunci kerana halaman telah diterbitkan dan mungkin sudah dikongsi. Mengubahnya akan merosakkan pautan lama.`,
          }),
          c &&
            u(`button`, {
              type: `button`,
              onClick: () => p(!0),
              style: {
                marginTop: 10,
                padding: `6px 10px`,
                borderRadius: 4,
                border: `1px solid #b26b00`,
                background: `transparent`,
                color: `inherit`,
                cursor: `pointer`,
              },
              children: `Buka kunci (Pentadbir sahaja)`,
            }),
        ],
      });
}
var p = n({
    name: `diarkibkan`,
    title: `Arkibkan (sembunyikan daripada laman web)`,
    description: `Gunakan ini dan bukannya memadam. Item akan hilang dari laman web tetapi boleh dipulihkan dari senarai "Arkib".`,
    type: `boolean`,
    initialValue: !1,
  }),
  m = [
    { title: `Kuliah`, value: `kuliah` },
    { title: `Program Khas`, value: `program-khas` },
    { title: `Kelas`, value: `kelas` },
    { title: `Gotong-royong`, value: `gotong-royong` },
    { title: `Kenduri / Majlis`, value: `kenduri-majlis` },
    { title: `Mesyuarat`, value: `mesyuarat` },
    { title: `Lain-lain`, value: `lain-lain` },
  ],
  h = [
    { title: `Umum`, value: `umum` },
    { title: `Muslimah`, value: `muslimah` },
    { title: `Kanak-kanak`, value: `kanak-kanak` },
    { title: `Remaja`, value: `remaja` },
  ],
  g = [
    { title: `Dijadualkan`, value: `dijadualkan` },
    { title: `Dipinda`, value: `dipinda` },
    { title: `Ditangguhkan`, value: `ditangguhkan` },
    { title: `Dibatalkan`, value: `dibatalkan` },
  ],
  _ = [
    { title: `Selepas Subuh`, value: `selepas-subuh` },
    { title: `Sebelum Zohor`, value: `sebelum-zohor` },
    { title: `Selepas Zohor`, value: `selepas-zohor` },
    { title: `Selepas solat Jumaat`, value: `selepas-jumaat` },
    { title: `Selepas Asar`, value: `selepas-asar` },
    { title: `Sebelum Maghrib`, value: `sebelum-maghrib` },
    { title: `Selepas Maghrib`, value: `selepas-maghrib` },
    { title: `Selepas Isyak`, value: `selepas-isyak` },
  ],
  v = [
    { title: `Isnin`, value: `isnin` },
    { title: `Selasa`, value: `selasa` },
    { title: `Rabu`, value: `rabu` },
    { title: `Khamis`, value: `khamis` },
    { title: `Jumaat`, value: `jumaat` },
    { title: `Sabtu`, value: `sabtu` },
    { title: `Ahad`, value: `ahad` },
  ],
  y = [
    { title: `Penaung`, value: `penaung` },
    { title: `Pengurusan Utama`, value: `pengurusan-utama` },
    { title: `Pegawai Masjid`, value: `pegawai-masjid` },
    { title: `AJK Biro`, value: `ajk-biro` },
  ],
  b = (e, t) => e.find((e) => e.value === t)?.title ?? t ?? ``,
  x = r({
    name: `aktiviti`,
    title: `Aktiviti`,
    type: `document`,
    fields: [
      n({
        name: `tajuk`,
        title: `Tajuk`,
        description: `Ringkas dan jelas. Contoh: Gotong-royong Perdana Sambut Ramadan`,
        type: `string`,
        validation: (e) => e.required().max(80),
      }),
      n({
        name: `slug`,
        title: `Pautan (URL)`,
        description: `Dijana daripada tajuk. Jangan ubah selepas diterbitkan — pautan yang telah dikongsi akan rosak.`,
        type: `slug`,
        components: { input: f },
        options: { source: `tajuk`, maxLength: 80 },
        validation: (e) => e.required(),
      }),
      n({
        name: `tarikhMula`,
        title: `Tarikh`,
        type: `date`,
        options: { dateFormat: `D MMMM YYYY` },
        validation: (e) =>
          e.required().custom(
            (e) =>
              !e ||
              e >= new Date().toISOString().slice(0, 10) || {
                message: `Tarikh ini telah berlalu.`,
                level: `warning`,
              },
          ),
      }),
      n({
        name: `tarikhTamat`,
        title: `Tarikh tamat (jika lebih sehari)`,
        type: `date`,
        options: { dateFormat: `D MMMM YYYY` },
        validation: (e) =>
          e.custom((e, { document: t }) => {
            let n = t?.tarikhMula;
            return !e || !n || e >= n || `Tarikh tamat mesti selepas tarikh mula.`;
          }),
      }),
      n({ name: `masa`, title: `Masa`, type: `masa`, validation: (e) => e.required() }),
      n({
        name: `tempat`,
        title: `Tempat`,
        type: `reference`,
        to: [{ type: `tempat` }],
        validation: (e) => e.required(),
      }),
      n({
        name: `kategori`,
        title: `Kategori`,
        type: `string`,
        options: { list: m },
        validation: (e) => e.required(),
      }),
      n({
        name: `sasaran`,
        title: `Sasaran`,
        type: `string`,
        options: { list: h, layout: `radio`, direction: `horizontal` },
        initialValue: `umum`,
      }),
      n({ name: `penceramah`, title: `Penceramah / Penganjur`, type: `string` }),
      n({ name: `penerangan`, title: `Penerangan`, type: `text`, rows: 4 }),
      n({
        name: `poster`,
        title: `Poster (pilihan)`,
        description: `Jika kosong, laman web akan menjana kad secara automatik.`,
        type: `gambar`,
      }),
      n({
        name: `status`,
        title: `Status`,
        type: `string`,
        options: { list: g, layout: `radio` },
        initialValue: `dijadualkan`,
        validation: (e) => e.required(),
      }),
      n({
        name: `tarikhBaharu`,
        title: `Tarikh baharu`,
        type: `date`,
        options: { dateFormat: `D MMMM YYYY` },
        hidden: ({ document: e }) => e?.status !== `ditangguhkan`,
      }),
      n({
        name: `notaPerubahan`,
        title: `Nota perubahan`,
        description: `Dipaparkan dengan jelas kepada jemaah. Contoh: "Ditangguhkan kerana cuti umum."`,
        type: `string`,
        hidden: ({ document: e }) => !e?.status || e.status === `dijadualkan`,
        validation: (e) =>
          e.custom((e, { document: t }) =>
            !t?.status || t.status === `dijadualkan` || e ? !0 : `Sila terangkan perubahan untuk jemaah.`,
          ),
      }),
      p,
    ],
    orderings: [
      {
        title: `Tarikh (terkini dahulu)`,
        name: `tarikhDesc`,
        by: [{ field: `tarikhMula`, direction: `desc` }],
      },
    ],
    preview: {
      select: { tajuk: `tajuk`, tarikh: `tarikhMula`, status: `status`, media: `poster` },
      prepare: ({ tajuk: e, tarikh: t, status: n, media: r }) => ({
        title: e,
        subtitle: [t, n && n !== `dijadualkan` ? b(g, n).toUpperCase() : ``].filter(Boolean).join(` · `),
        media: r,
      }),
    },
  }),
  S = r({
    name: `jawatan`,
    title: `Jawatan`,
    type: `document`,
    fields: [
      n({
        name: `jawatan`,
        title: `Jawatan`,
        description: `Contoh: Pengerusi, Setiausaha, Imam`,
        type: `string`,
        validation: (e) => e.required(),
      }),
      n({
        name: `kumpulan`,
        title: `Kumpulan`,
        type: `string`,
        options: { list: y, layout: `radio` },
        validation: (e) => e.required(),
      }),
      n({ name: `biro`, title: `Biro / portfolio (jika ada)`, type: `string` }),
      n({
        name: `kosong`,
        title: `Jawatan kosong`,
        description: `Tandakan jika belum diisi. Laman web akan memaparkan "Jawatan kosong".`,
        type: `boolean`,
        initialValue: !1,
      }),
      n({
        name: `nama`,
        title: `Nama penyandang`,
        type: `string`,
        hidden: ({ document: e }) => !!e?.kosong,
        validation: (e) =>
          e.custom((e, { document: t }) =>
            t?.kosong || e ? !0 : `Sila isi nama, atau tandakan jawatan kosong.`,
          ),
      }),
      n({
        name: `gambar`,
        title: `Gambar (pilihan)`,
        type: `gambar`,
        hidden: ({ document: e }) => !!e?.kosong,
      }),
      n({
        name: `kebenaranGambar`,
        title: `Penyandang telah memberi kebenaran untuk gambar ini dipaparkan`,
        description: `Wajib jika ada gambar (D-72).`,
        type: `boolean`,
        hidden: ({ document: e }) => !e?.gambar,
        validation: (e) =>
          e.custom(
            (e, { document: t }) =>
              !t?.gambar || e === !0 || `Gambar hanya boleh diterbitkan dengan kebenaran penyandang.`,
          ),
      }),
      n({
        name: `susunan`,
        title: `Susunan dalam kumpulan`,
        description: `Nombor kecil dipaparkan dahulu. Contoh: Pengerusi = 1`,
        type: `number`,
        initialValue: 10,
        validation: (e) => e.required(),
      }),
      p,
    ],
    orderings: [
      {
        title: `Kumpulan, kemudian susunan`,
        name: `kumpulanSusunan`,
        by: [
          { field: `kumpulan`, direction: `asc` },
          { field: `susunan`, direction: `asc` },
        ],
      },
    ],
    preview: {
      select: { jawatan: `jawatan`, nama: `nama`, kosong: `kosong`, kumpulan: `kumpulan`, media: `gambar` },
      prepare: ({ jawatan: e, nama: t, kosong: n, kumpulan: r, media: i }) => ({
        title: e,
        subtitle: `${n ? `Jawatan kosong` : (t ?? ``)} · ${b(y, r)}`,
        media: i,
      }),
    },
  }),
  C = [
    { title: `Dibatalkan`, value: `dibatalkan` },
    { title: `Ditangguhkan ke tarikh lain`, value: `ditangguhkan` },
    { title: `Penceramah jemputan`, value: `penceramah-jemputan` },
    { title: `Tukar tempat`, value: `tukar-tempat` },
    { title: `Tukar masa`, value: `tukar-masa` },
  ],
  w = r({
    name: `kuliahPerubahan`,
    title: `Perubahan Kuliah`,
    type: `document`,
    fields: [
      n({
        name: `siri`,
        title: `Siri kuliah`,
        type: `reference`,
        to: [{ type: `kuliahSiri` }],
        validation: (e) => e.required(),
      }),
      n({
        name: `tarikh`,
        title: `Tarikh kuliah yang terlibat`,
        type: `date`,
        options: { dateFormat: `D MMMM YYYY` },
        validation: (e) =>
          e.required().custom(async (e, { document: t, getClient: n }) => {
            let r = t?.siri?._ref;
            if (!e || !r) return !0;
            let i = (t?._id ?? ``).replace(/^drafts\./, ``);
            return (
              (await n({ apiVersion: `2025-02-19` }).fetch(
                `count(*[_type == "kuliahPerubahan" && siri._ref == $siri && tarikh == $tarikh && !(_id in [$id, "drafts." + $id])])`,
                { siri: r, tarikh: e, id: i },
              )) === 0 || { message: `Sudah ada perubahan lain untuk tarikh ini.`, level: `warning` }
            );
          }),
      }),
      n({
        name: `jenis`,
        title: `Jenis perubahan`,
        type: `string`,
        options: { list: C, layout: `radio` },
        validation: (e) => e.required(),
      }),
      n({
        name: `tarikhBaharu`,
        title: `Tarikh baharu`,
        type: `date`,
        options: { dateFormat: `D MMMM YYYY` },
        hidden: ({ document: e }) => e?.jenis !== `ditangguhkan`,
        validation: (e) =>
          e.custom((e, { document: t }) =>
            t?.jenis !== `ditangguhkan` || e ? !0 : `Sila pilih tarikh baharu.`,
          ),
      }),
      n({
        name: `penceramahJemputan`,
        title: `Nama penceramah jemputan`,
        type: `string`,
        hidden: ({ document: e }) => e?.jenis !== `penceramah-jemputan`,
        validation: (e) =>
          e.custom((e, { document: t }) =>
            t?.jenis !== `penceramah-jemputan` || e ? !0 : `Sila isi nama penceramah.`,
          ),
      }),
      n({
        name: `tempatBaharu`,
        title: `Tempat baharu`,
        type: `reference`,
        to: [{ type: `tempat` }],
        hidden: ({ document: e }) => e?.jenis !== `tukar-tempat`,
        validation: (e) =>
          e.custom((e, { document: t }) =>
            t?.jenis !== `tukar-tempat` || e ? !0 : `Sila pilih tempat baharu.`,
          ),
      }),
      n({
        name: `masaBaharu`,
        title: `Masa baharu`,
        type: `masa`,
        hidden: ({ document: e }) => e?.jenis !== `tukar-masa`,
        validation: (e) =>
          e.custom((e, { document: t }) => (t?.jenis !== `tukar-masa` || e ? !0 : `Sila isi masa baharu.`)),
      }),
      n({
        name: `sebab`,
        title: `Sebab / nota untuk jemaah`,
        description: `Contoh: "Penceramah uzur." Dipaparkan di laman web.`,
        type: `string`,
      }),
      p,
    ],
    preview: {
      select: { siri: `siri.nama`, tarikh: `tarikh`, jenis: `jenis` },
      prepare: ({ siri: e, tarikh: t, jenis: n }) => ({
        title: `${e ?? `Kuliah`} — ${t ?? ``}`,
        subtitle: C.find((e) => e.value === n)?.title,
      }),
    },
  }),
  T = r({
    name: `kuliahSiri`,
    title: `Siri Kuliah`,
    type: `document`,
    fields: [
      n({
        name: `nama`,
        title: `Nama siri`,
        description: `Contoh: Kuliah Maghrib Mingguan`,
        type: `string`,
        validation: (e) => e.required(),
      }),
      n({
        name: `slug`,
        title: `Pautan (URL)`,
        description: `Dijana daripada nama. Jangan ubah selepas diterbitkan.`,
        type: `slug`,
        components: { input: f },
        options: { source: `nama`, maxLength: 80 },
        validation: (e) => e.required(),
      }),
      n({
        name: `jenis`,
        title: `Kekerapan`,
        type: `string`,
        options: {
          list: [
            { title: `Setiap minggu`, value: `mingguan` },
            { title: `Sebulan sekali`, value: `bulanan` },
          ],
          layout: `radio`,
        },
        initialValue: `mingguan`,
        validation: (e) => e.required(),
      }),
      n({
        name: `hari`,
        title: `Hari`,
        type: `string`,
        options: { list: v },
        validation: (e) => e.required(),
      }),
      n({
        name: `mingguKe`,
        title: `Minggu ke berapa dalam bulan`,
        description: `Contoh: "Pertama" + Isnin = Isnin pertama setiap bulan`,
        type: `string`,
        options: {
          list: [
            { title: `Pertama`, value: `1` },
            { title: `Kedua`, value: `2` },
            { title: `Ketiga`, value: `3` },
            { title: `Keempat`, value: `4` },
            { title: `Terakhir`, value: `terakhir` },
          ],
        },
        hidden: ({ document: e }) => e?.jenis !== `bulanan`,
        validation: (e) =>
          e.custom((e, { document: t }) =>
            t?.jenis !== `bulanan` || e ? !0 : `Sila pilih minggu ke berapa.`,
          ),
      }),
      n({ name: `masa`, title: `Masa`, type: `masa`, validation: (e) => e.required() }),
      n({
        name: `tempat`,
        title: `Tempat`,
        type: `reference`,
        to: [{ type: `tempat` }],
        validation: (e) => e.required(),
      }),
      n({ name: `penceramah`, title: `Penceramah biasa`, type: `string` }),
      n({ name: `topik`, title: `Topik / Kitab`, type: `string` }),
      n({
        name: `sasaran`,
        title: `Sasaran`,
        type: `string`,
        options: { list: h, layout: `radio`, direction: `horizontal` },
        initialValue: `umum`,
      }),
      n({
        name: `aktifDari`,
        title: `Aktif dari`,
        type: `date`,
        options: { dateFormat: `D MMMM YYYY` },
        validation: (e) => e.required(),
      }),
      n({
        name: `aktifHingga`,
        title: `Aktif hingga (jika ada)`,
        description: `Kosongkan jika berterusan. Untuk rehat Ramadan, gunakan "Perubahan" bagi setiap tarikh.`,
        type: `date`,
        options: { dateFormat: `D MMMM YYYY` },
        validation: (e) =>
          e.custom((e, { document: t }) => {
            let n = t?.aktifDari;
            return !e || !n || e >= n || `Tarikh akhir mesti selepas tarikh mula.`;
          }),
      }),
      n({ name: `penerangan`, title: `Penerangan`, type: `text`, rows: 3 }),
      p,
    ],
    preview: {
      select: { nama: `nama`, jenis: `jenis`, hari: `hari`, mingguKe: `mingguKe`, penceramah: `penceramah` },
      prepare: ({ nama: e, jenis: t, hari: n, mingguKe: r, penceramah: i }) => {
        let a = b(v, n);
        return {
          title: e,
          subtitle: [
            t === `bulanan`
              ? `${a} ${r === `terakhir` ? `terakhir` : `minggu ke-${r}`} setiap bulan`
              : `Setiap ${a}`,
            i,
          ]
            .filter(Boolean)
            .join(` · `),
        };
      },
    },
  }),
  E = r({
    name: `notis`,
    title: `Notis Penting`,
    type: `document`,
    fields: [
      n({
        name: `mesej`,
        title: `Mesej`,
        description: `Ringkas. Contoh: "Kuliah Maghrib Isnin ini dibatalkan."`,
        type: `string`,
        validation: (e) => e.required().max(140),
      }),
      n({
        name: `tahap`,
        title: `Tahap`,
        type: `string`,
        options: {
          list: [
            { title: `Makluman`, value: `makluman` },
            { title: `Penting`, value: `penting` },
          ],
          layout: `radio`,
          direction: `horizontal`,
        },
        initialValue: `makluman`,
      }),
      n({
        name: `paparDari`,
        title: `Papar dari`,
        type: `datetime`,
        options: { dateFormat: `D MMMM YYYY`, timeFormat: `h:mm a` },
        initialValue: () => new Date().toISOString(),
        validation: (e) => e.required(),
      }),
      n({
        name: `paparHingga`,
        title: `Papar hingga`,
        description: `Notis akan hilang secara automatik selepas tarikh ini.`,
        type: `datetime`,
        options: { dateFormat: `D MMMM YYYY`, timeFormat: `h:mm a` },
        validation: (e) =>
          e.required().custom((e, { document: t }) => {
            let n = t?.paparDari;
            return !e || !n || e > n || `Mesti selepas "Papar dari".`;
          }),
      }),
      n({ name: `pautan`, title: `Pautan (pilihan)`, description: `Contoh: /kuliah`, type: `string` }),
      p,
    ],
    preview: { select: { title: `mesej`, subtitle: `paparHingga` } },
  }),
  D = r({
    name: `gambar`,
    title: `Gambar`,
    type: `image`,
    options: { hotspot: !0 },
    fields: [
      n({
        name: `alt`,
        title: `Penerangan gambar (untuk pembaca skrin)`,
        description: `Terangkan apa yang ada dalam gambar. Contoh: "Dewan akad nikah dengan susunan kerusi untuk 50 tetamu"`,
        type: `string`,
        validation: (e) => e.required().error(`Sila isi penerangan gambar.`),
      }),
    ],
  }),
  O = /^([01]\d|2[0-3]):[0-5]\d$/,
  k = r({
    name: `masa`,
    title: `Masa`,
    type: `object`,
    fields: [
      n({
        name: `jenis`,
        title: `Jenis masa`,
        type: `string`,
        options: {
          list: [
            { title: `Jam tertentu (contoh 8:30 malam)`, value: `jam` },
            { title: `Berdasarkan waktu solat (contoh Selepas Maghrib)`, value: `solat` },
          ],
          layout: `radio`,
        },
        initialValue: `solat`,
        validation: (e) => e.required(),
      }),
      n({
        name: `jam`,
        title: `Jam`,
        description: `Format 24 jam. Contoh: 20:30 untuk 8:30 malam`,
        type: `string`,
        hidden: ({ parent: e }) => e?.jenis !== `jam`,
        validation: (e) =>
          e.custom((e, { parent: t }) =>
            t?.jenis === `jam`
              ? e
                ? O.test(e) || `Gunakan format 24 jam, contoh 20:30.`
                : `Sila isi jam.`
              : !0,
          ),
      }),
      n({
        name: `waktuSolat`,
        title: `Waktu solat`,
        type: `string`,
        options: { list: _ },
        hidden: ({ parent: e }) => e?.jenis !== `solat`,
        validation: (e) =>
          e.custom((e, { parent: t }) => (t?.jenis !== `solat` || e ? !0 : `Sila pilih waktu solat.`)),
      }),
      n({
        name: `jamTamat`,
        title: `Jam tamat (jika ada)`,
        description: `Pilihan. Format 24 jam, contoh 22:00`,
        type: `string`,
        validation: (e) => e.custom((e) => !e || O.test(e) || `Gunakan format 24 jam, contoh 22:00.`),
      }),
    ],
    preview: {
      select: { jenis: `jenis`, jam: `jam`, waktuSolat: `waktuSolat` },
      prepare: ({ jenis: e, jam: t, waktuSolat: n }) => ({ title: e === `jam` ? t : b(_, n) }),
    },
  }),
  A = r({
    name: `perkhidmatan`,
    title: `Perkhidmatan`,
    type: `document`,
    groups: [
      { name: `utama`, title: `Utama`, default: !0 },
      { name: `butiran`, title: `Butiran` },
      { name: `tempahan`, title: `Tempahan & Hubungi` },
      { name: `soalan`, title: `Soalan Lazim` },
    ],
    fields: [
      n({
        name: `nama`,
        title: `Nama perkhidmatan`,
        description: `Contoh: Dewan Akad Nikah`,
        type: `string`,
        group: `utama`,
        validation: (e) => e.required().max(60),
      }),
      n({
        name: `slug`,
        title: `Pautan (URL)`,
        description: `Contoh: dewan-akad-nikah. Jangan ubah selepas diterbitkan — penting untuk carian Google.`,
        type: `slug`,
        components: { input: f },
        options: { source: `nama`, maxLength: 60 },
        group: `utama`,
        validation: (e) => e.required(),
      }),
      n({
        name: `ringkasan`,
        title: `Ringkasan satu ayat`,
        description: `Dipaparkan pada kad perkhidmatan dan hasil carian Google (maksimum 160 aksara).`,
        type: `string`,
        group: `utama`,
        validation: (e) => e.required().max(160),
      }),
      n({
        name: `gambar`,
        title: `Gambar (3 hingga 8)`,
        type: `array`,
        of: [e({ type: `gambar` })],
        group: `utama`,
        validation: (e) =>
          e
            .max(8)
            .custom(
              (e) =>
                !e ||
                e.length >= 3 || { message: `Disyorkan sekurang-kurangnya 3 gambar.`, level: `warning` },
            ),
      }),
      n({
        name: `susunan`,
        title: `Susunan paparan`,
        description: `Nombor kecil dipaparkan dahulu.`,
        type: `number`,
        group: `utama`,
        initialValue: 10,
      }),
      n({
        name: `penerangan`,
        title: `Penerangan`,
        description: `2 hingga 4 perenggan pendek dalam bahasa mudah.`,
        type: `array`,
        of: [
          e({
            type: `block`,
            styles: [{ title: `Biasa`, value: `normal` }],
            lists: [{ title: `Senarai`, value: `bullet` }],
            marks: { decorators: [{ title: `Tebal`, value: `strong` }], annotations: [] },
          }),
        ],
        group: `butiran`,
      }),
      n({
        name: `kemudahan`,
        title: `Kemudahan disediakan`,
        description: `Satu kemudahan setiap baris. Contoh: Sistem PA, Kerusi 100 buah, Dapur`,
        type: `array`,
        of: [e({ type: `string` })],
        group: `butiran`,
      }),
      n({
        name: `kapasiti`,
        title: `Kapasiti`,
        description: `Contoh: "Sehingga 150 orang"`,
        type: `string`,
        group: `butiran`,
      }),
      n({
        name: `kadar`,
        title: `Kadar / Sumbangan`,
        type: `object`,
        group: `butiran`,
        fields: [
          n({
            name: `cara`,
            title: `Cara paparan`,
            type: `string`,
            options: {
              list: [
                { title: `Kadar tepat`, value: `tepat` },
                { title: `Bermula dari`, value: `bermula` },
                { title: `Sila hubungi kami`, value: `hubungi` },
              ],
              layout: `radio`,
            },
            initialValue: `hubungi`,
          }),
          n({
            name: `jumlah`,
            title: `Jumlah (RM)`,
            type: `number`,
            hidden: ({ parent: e }) => !e?.cara || e.cara === `hubungi`,
            validation: (e) => e.min(0),
          }),
          n({
            name: `nota`,
            title: `Nota`,
            description: `Contoh: "sehari", "termasuk pembersihan"`,
            type: `string`,
          }),
        ],
      }),
      n({
        name: `syarat`,
        title: `Syarat & peraturan`,
        type: `array`,
        of: [e({ type: `string` })],
        group: `butiran`,
      }),
      n({
        name: `caraTempah`,
        title: `Cara menempah (langkah demi langkah)`,
        type: `array`,
        of: [e({ type: `string` })],
        group: `tempahan`,
      }),
      n({
        name: `hubungi`,
        title: `Hubungi (jawatan)`,
        description: `Contoh: "Pengurus Dewan" — tidak semestinya nama peribadi.`,
        type: `string`,
        group: `tempahan`,
      }),
      n({
        name: `whatsapp`,
        title: `Nombor WhatsApp untuk perkhidmatan ini`,
        description: `Kosongkan untuk menggunakan nombor WhatsApp masjid. Format 60xxxxxxxxx.`,
        type: `string`,
        group: `tempahan`,
        validation: (e) =>
          e.custom((e) => !e || /^60\d{8,10}$/.test(e) || `Gunakan format 60xxxxxxxxx tanpa ruang.`),
      }),
      n({
        name: `soalanLazim`,
        title: `Soalan lazim`,
        description: `3 hingga 6 soalan. Membantu jemaah dan carian Google.`,
        type: `array`,
        group: `soalan`,
        of: [
          e({
            type: `object`,
            name: `soalan`,
            fields: [
              n({ name: `soalan`, title: `Soalan`, type: `string`, validation: (e) => e.required() }),
              n({
                name: `jawapan`,
                title: `Jawapan`,
                type: `text`,
                rows: 3,
                validation: (e) => e.required(),
              }),
            ],
            preview: { select: { title: `soalan`, subtitle: `jawapan` } },
          }),
        ],
        validation: (e) => e.max(6),
      }),
      { ...p, group: `utama` },
    ],
    orderings: [{ title: `Susunan paparan`, name: `susunan`, by: [{ field: `susunan`, direction: `asc` }] }],
    preview: { select: { title: `nama`, subtitle: `ringkasan`, media: `gambar.0` } },
  }),
  j = r({
    name: `siteSettings`,
    title: `Tetapan Masjid`,
    type: `document`,
    fields: [
      n({
        name: `officialName`,
        title: `Nama rasmi masjid`,
        description: `Contoh: Masjid Al-Ihsan Felda Sungai Panching Selatan`,
        type: `string`,
        validation: (e) => e.required(),
      }),
      n({ name: `address`, title: `Alamat penuh`, type: `text`, rows: 3, validation: (e) => e.required() }),
      n({ name: `mapUrl`, title: `Pautan Google Maps`, type: `url` }),
      n({
        name: `phone`,
        title: `Nombor telefon pejabat`,
        description: `Contoh: 09-123 4567`,
        type: `string`,
      }),
      n({
        name: `whatsapp`,
        title: `Nombor WhatsApp masjid`,
        description: `Dengan kod negara, tanpa ruang. Contoh: 60123456789`,
        type: `string`,
        validation: (e) =>
          e
            .regex(/^60\d{8,10}$/, { name: `nombor WhatsApp`, invert: !1 })
            .warning(`Gunakan format 60xxxxxxxxx tanpa ruang atau tanda sempang.`),
      }),
      n({ name: `officeHours`, title: `Waktu pejabat`, type: `string` }),
      n({
        name: `email`,
        title: `Emel rasmi`,
        type: `string`,
        validation: (e) => e.email().error(`Alamat emel tidak sah.`),
      }),
      n({
        name: `sesiOrganisasi`,
        title: `Sesi carta organisasi`,
        description: `Dipaparkan pada Carta Organisasi. Contoh: Sesi 2026/2027`,
        type: `string`,
      }),
      n({ name: `facebook`, title: `Pautan Facebook`, type: `url` }),
    ],
    preview: { prepare: () => ({ title: `Tetapan Masjid` }) },
  }),
  M = [
    D,
    k,
    x,
    T,
    w,
    E,
    A,
    S,
    r({
      name: `tempat`,
      title: `Tempat`,
      type: `document`,
      fields: [
        n({
          name: `nama`,
          title: `Nama tempat`,
          description: `Contoh: Dewan Solat Utama, Dewan Serbaguna`,
          type: `string`,
          validation: (e) => e.required(),
        }),
      ],
      preview: { select: { title: `nama` } },
    }),
    j,
  ],
  N = new Set([`siteSettings`]),
  P = (e, t, n, r) =>
    e
      .listItem()
      .title(n)
      .schemaType(t)
      .child(
        e
          .documentTypeList(t)
          .title(n)
          .filter(`_type == $type && diarkibkan != true`)
          .params({ type: t })
          .defaultOrdering(r),
      ),
  F = t({
    name: `default`,
    title: `Masjid Al-Ihsan — Pentadbiran`,
    projectId: `1xd617ey`,
    dataset: `production`,
    plugins: [
      c({
        title: `Kandungan`,
        structure: (e) =>
          e
            .list()
            .title(`Kandungan`)
            .items([
              P(e, `aktiviti`, `Aktiviti & Kalendar`, [{ field: `tarikhMula`, direction: `desc` }]),
              e
                .listItem()
                .title(`Jadual Kuliah`)
                .child(
                  e
                    .list()
                    .title(`Jadual Kuliah`)
                    .items([
                      P(e, `kuliahSiri`, `Siri Kuliah`, [{ field: `nama`, direction: `asc` }]),
                      P(e, `kuliahPerubahan`, `Perubahan (Batal / Penceramah Jemputan)`, [
                        { field: `tarikh`, direction: `desc` },
                      ]),
                    ]),
                ),
              P(e, `notis`, `Notis Penting`, [{ field: `paparDari`, direction: `desc` }]),
              e.divider(),
              P(e, `perkhidmatan`, `Perkhidmatan`, [{ field: `susunan`, direction: `asc` }]),
              P(e, `jawatan`, `Carta Organisasi`, [
                { field: `kumpulan`, direction: `asc` },
                { field: `susunan`, direction: `asc` },
              ]),
              e.divider(),
              e.documentTypeListItem(`tempat`).title(`Tempat`),
              e
                .listItem()
                .title(`Tetapan Masjid`)
                .id(`siteSettings`)
                .child(
                  e.document().schemaType(`siteSettings`).documentId(`siteSettings`).title(`Tetapan Masjid`),
                ),
              e.divider(),
              e
                .listItem()
                .title(`Arkib`)
                .child(
                  e
                    .documentList()
                    .title(`Arkib (tidak dipaparkan di laman web)`)
                    .filter(`diarkibkan == true`),
                ),
            ]),
      }),
    ],
    schema: { types: M, templates: (e) => e.filter(({ schemaType: e }) => !N.has(e)) },
    document: {
      actions: (e, { schemaType: t, currentUser: n }) =>
        N.has(t)
          ? e.filter(({ action: e }) => e && [`publish`, `discardChanges`, `restore`].includes(e))
          : n?.roles?.some((e) => e.name === `administrator`)
            ? e
            : e.filter(({ action: e }) => e !== `delete`),
    },
  });
i(document.getElementById(`sanity`), F, { reactStrictMode: !1, basePath: `/` });
