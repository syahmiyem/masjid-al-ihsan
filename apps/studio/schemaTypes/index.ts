import { aktiviti } from './aktiviti';
import { jawatan } from './jawatan';
import { kuliahPerubahan } from './kuliahPerubahan';
import { kuliahSiri } from './kuliahSiri';
import { notis } from './notis';
import { penceramah } from './penceramah';
import { gambar } from './objects/gambar';
import { masa } from './objects/masa';
import { perkhidmatan } from './perkhidmatan';
import { siteSettings } from './siteSettings';
import { tempat } from './tempat';

export const schemaTypes = [
  // objects
  gambar,
  masa,
  // documents
  aktiviti,
  kuliahSiri,
  kuliahPerubahan,
  notis,
  perkhidmatan,
  jawatan,
  penceramah,
  tempat,
  siteSettings,
];

/** Document types that exist exactly once (no create/duplicate/delete). */
export const SINGLETONS = new Set(['siteSettings']);
