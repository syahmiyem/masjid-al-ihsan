import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkDerma, groupDigits, parseEmv, type DermaConfig } from './derma.ts';

const base: DermaConfig = {
  status: 'rasmi',
  accountName: 'MASJID AL-IHSAN FELDA SG PANCHING SELATAN',
  bank: 'Bank Contoh',
  accountNumber: '123456789012',
  qrImage: 'duitnow-qr.png',
  funds: [],
};
// Minimal EMV-style payload: 00 format, 59 merchant name, 63 CRC (not validated here)
const emv = (name: string) => `000201` + `59${String(name.length).padStart(2, '0')}${name}` + `6304ABCD`;

test('parses EMV TLV', () => {
  assert.equal(parseEmv(emv('MASJID AL-IHSAN'))?.get('59'), 'MASJID AL-IHSAN');
  assert.equal(parseEmv('not emv'), null);
});

test('matching recipient name passes (bank may truncate the name)', () => {
  assert.deepEqual(checkDerma(base, emv('MASJID AL-IHSAN FELDA SG')), []);
});

test('a different recipient fails the build', () => {
  assert.match(checkDerma(base, emv('AHMAD BIN ALI'))[0], /does not match accountName/);
});

test('exact payload mode (CONTOH placeholder)', () => {
  const contoh = {
    ...base,
    status: 'contoh' as const,
    accountNumber: '000000000000',
    expectedQrPayload: 'CONTOH',
  };
  assert.deepEqual(checkDerma(contoh, 'CONTOH'), []);
  assert.equal(checkDerma(contoh, 'SOMETHING ELSE').length, 1);
});

test('undecodable QR and bad account number are reported', () => {
  assert.deepEqual(checkDerma(base, null), ['The QR image could not be decoded.']);
  assert.match(checkDerma({ ...base, accountNumber: '1234 5678' }, emv('MASJID AL-IHSAN'))[0], /6–20 digits/);
});

test('groupDigits', () => {
  assert.equal(groupDigits('123456789012'), '1234 5678 9012');
  assert.equal(groupDigits('1234567890'), '1234 5678 90');
});
