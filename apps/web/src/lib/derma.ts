// Donation details check (plan 4.9, D-81): the QR's payload must match the configured account.
// Pure functions; scripts/check-derma.ts runs them against config/derma/ on every build.

export type DermaConfig = {
  status: 'contoh' | 'rasmi';
  accountName: string;
  bank: string;
  accountNumber: string;
  qrImage: string;
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
  const name = emv?.get('59'); // EMVCo "Merchant Name"
  if (!name) {
    problems.push(
      'QR has no recipient name (EMV tag 59); set expectedQrPayload to the approved payload instead.',
    );
  } else if (
    !normalise(config.accountName).startsWith(normalise(name)) &&
    !normalise(name).startsWith(normalise(config.accountName))
  ) {
    problems.push(`QR recipient "${name}" does not match accountName "${config.accountName}".`);
  }
  return problems;
}

/** "123456789012" → "1234 5678 9012" for reading aloud / copying by eye. */
export function groupDigits(n: string): string {
  return n.replace(/(\d{4})(?=\d)/g, '$1 ');
}
