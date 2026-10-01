import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkDerma, emvCrc, groupDigits, parseEmv, type DermaConfig } from './derma.ts';

const base: DermaConfig = {
  status: 'rasmi',
  accountName: 'Tetuan Setiausaha Badan Masjid Felda Sungai Panching Selatan',
  qrName: 'Masjid Al Ihsan',
  bank: 'Bank Islam',
  accountNumber: '06019010026869',
  qrImage: 'duitnow-qr.png',
  funds: [],
};
const tlv = (id: string, v: string) => `${id}${String(v.length).padStart(2, '0')}${v}`;
/** A well-formed DuitNow-style payload with a valid CRC. */
const duitnow = (name: string) => {
  const body =
    tlv('00', '01') + tlv('01', '11') + tlv('26', tlv('00', 'A0000006150001')) + tlv('59', name) + '6304';
  return body + emvCrc(body);
};

test('CRC matches the real Masjid Al-Ihsan QR (Bank Islam, value 7CBD is checked in the build)', () => {
  assert.equal(emvCrc('123456789'), '29B1'); // CRC-16/CCITT-FALSE check value
});

test('parses EMV TLV', () => {
  assert.equal(parseEmv(duitnow('Masjid Al Ihsan '))?.get('59'), 'Masjid Al Ihsan ');
  assert.equal(parseEmv('not emv'), null);
});

test('matching QR passes; trailing spaces and case are ignored', () => {
  assert.deepEqual(checkDerma(base, duitnow('MASJID AL IHSAN ')), []);
});

test('a different recipient fails the build', () => {
  assert.match(checkDerma(base, duitnow('AHMAD BIN ALI')).join(), /does not match qrName/);
});

test('a tampered payload fails the CRC check', () => {
  const good = duitnow('Masjid Al Ihsan');
  const tampered = good.replace('Masjid Al Ihsan', 'Masjid Al Ihsam');
  assert.match(checkDerma(base, tampered).join(), /checksum/);
});

test('non-DuitNow codes are rejected', () => {
  const body =
    tlv('00', '01') + tlv('26', tlv('00', 'A0000000041010')) + tlv('59', 'Masjid Al Ihsan') + '6304';
  assert.match(checkDerma(base, body + emvCrc(body)).join(), /not a DuitNow/);
  assert.match(checkDerma(base, 'https://example.com').join(), /not an EMVCo/);
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
  assert.match(
    checkDerma({ ...base, accountNumber: '0601-9010' }, duitnow('Masjid Al Ihsan'))[0],
    /6–20 digits/,
  );
});

test('groupDigits', () => {
  assert.equal(groupDigits('123456789012'), '1234 5678 9012');
});
