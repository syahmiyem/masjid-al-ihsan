// Content shapes as returned by the GROQ queries in sanity.ts (references already resolved to names).

export type Masa = {
  jenis: 'jam' | 'solat';
  jam?: string;
  waktuSolat?: string;
  jamTamat?: string;
};

export type ActivityStatus = 'dijadualkan' | 'dipinda' | 'ditangguhkan' | 'dibatalkan';

export type Aktiviti = {
  _id: string;
  tajuk: string;
  slug: string;
  tarikhMula: string;
  tarikhTamat?: string;
  masa: Masa;
  tempat: string;
  kategori: string;
  sasaran?: string;
  penceramah?: string;
  penerangan?: string;
  status: ActivityStatus;
  tarikhBaharu?: string;
  notaPerubahan?: string;
};

export type KuliahSiri = {
  _id: string;
  nama: string;
  slug: string;
  jenis: 'mingguan' | 'bulanan';
  hari: Weekday;
  mingguKe?: '1' | '2' | '3' | '4' | 'terakhir';
  masa: Masa;
  tempat: string;
  penceramah?: string;
  topik?: string;
  sasaran?: string;
  aktifDari: string;
  aktifHingga?: string;
  penerangan?: string;
};

export type KuliahPerubahan = {
  _id: string;
  siri: string; // kuliahSiri _id
  tarikh: string;
  jenis: 'dibatalkan' | 'ditangguhkan' | 'penceramah-jemputan' | 'tukar-tempat' | 'tukar-masa';
  tarikhBaharu?: string;
  penceramahJemputan?: string;
  tempatBaharu?: string;
  masaBaharu?: Masa;
  sebab?: string;
};

export type Weekday = 'ahad' | 'isnin' | 'selasa' | 'rabu' | 'khamis' | 'jumaat' | 'sabtu';
