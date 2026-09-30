// Build-time guard for donation details (plan 4.9, D-81). Fails the build — leaving the previous deploy
// live — if the DuitNow QR does not decode to the configured account.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { checkDerma, type DermaConfig } from '../src/lib/derma.ts';

const dir = join(import.meta.dirname, '..', '..', '..', 'config', 'derma');
const config = JSON.parse(readFileSync(join(dir, 'derma.json'), 'utf8')) as DermaConfig;
const png = PNG.sync.read(readFileSync(join(dir, config.qrImage)));
const payload = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data ?? null;

const problems = checkDerma(config, payload);
if (problems.length) {
  console.error(`Derma check FAILED (config/derma):\n  - ${problems.join('\n  - ')}`);
  process.exit(1);
}
console.log(`Derma check OK: ${config.status === 'contoh' ? 'CONTOH placeholder' : config.accountName}`);
