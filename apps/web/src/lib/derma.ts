// Sumbangan (donation) details check (plan 4.9, D-81): the QR's payload must be a valid DuitNow / EMVCo
// code whose recipient name matches the configured QR name. Pure functions; scripts/check-derma.ts runs
// them against config/derma/ on every build.

export type DermaConfig = {
  status: 'contoh' | 'rasmi';
  /** Account holder name shown by banking apps for a transfer to the account number */
  accountName: string;
  /** Recipient name shown by banking apps when the QR is scanned (EMV tag 59) */
  qrName?: string;
  bank: string;
  /** Digits only — used for "Salin Nombor Akaun" */
  accountNumber: string;
  /** How the mosque writes the number on its own materials, e.g. "060190-1002-6869" */
  accountNumberDisplay?: string;
  qrImage: string;
  /** Exact payload, for the CONTOH placeholder (not a DuitNow code) */
  expectedQrPayload?: string;
  funds: unknown[];
};

/** Top-level EMVCo TLV fields ("ID LEN VALUE", 2+2 digits), as used by DuitNow QR. */
export function parseEmv(payload: string): Map<string, string> | null {
  const fields = new Map<string, string>();
  let i = 0;
  while (i < payload.length) {
    const id = payload.slice(i, i + 2);
    const len = Number(payload.slice(i + 2, i + 4));
    if (!/^\d{2}$/.test(id) || Number.isNaN(len) || i + 4 + len > payload.length) return null;
    fields.set(id, payload.slice(i + 4, i + 4 + len));
    i += 4 + len;
  }
  return fields.size > 0 ? fields : null;
}

/** CRC-16/CCITT-FALSE over the payload up to and including "6304" (EMVCo tag 63). */
export function emvCrc(payload: string): string {
  let crc = 0xffff;
  for (const byte of new TextEncoder().encode(payload)) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

const normalise = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '');

/** Returns a list of problems; empty means the QR matches the config. */
export function checkDerma(config: DermaConfig, payload: string | null): string[] {
  const problems: string[] = [];
  if (!payload) return ['The QR image could not be decoded.'];
  if (!/^\d{6,20}$/.test(config.accountNumber))
    problems.push('accountNumber must be 6–20 digits, no spaces.');

  if (config.expectedQrPayload !== undefined) {
    if (payload !== config.expectedQrPayload) problems.push('QR payload does not match expectedQrPayload.');
    return problems;
  }

  const emv = parseEmv(payload);
  if (!emv) return [...problems, 'QR is not an EMVCo/DuitNow payment code.'];
  const crcAt = payload.lastIndexOf('6304');
  if (crcAt === -1 || emvCrc(payload.slice(0, crcAt + 4)) !== payload.slice(crcAt + 4)) {
    problems.push('QR checksum (CRC) is invalid — the code is damaged or altered.');
  }
  if (!/A000000615/.test(emv.get('26') ?? '')) problems.push('QR is not a DuitNow (PayNet) code.');
  const name = emv.get('59')?.trim();
  const expected = config.qrName ?? config.accountName;
  if (!name) {
    problems.push('QR has no recipient name (EMV tag 59).');
  } else if (normalise(name) !== normalise(expected)) {
    problems.push(`QR recipient "${name}" does not match qrName "${expected}".`);
  }
  return problems;
}

/** "123456789012" → "1234 5678 9012" for reading aloud / copying by eye. */
export function groupDigits(n: string): string {
  return n.replace(/(\d{4})(?=\d)/g, '$1 ');
}
