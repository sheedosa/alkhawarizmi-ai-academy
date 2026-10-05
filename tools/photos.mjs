// Makes web sizes for every original photo in assets/photos/.
//   assets/photos/<id>.jpg|jpeg|png  ->  assets/photos/web/<id>-<width>.webp  (640 … 3840)
//   assets/photos/manifest.json      ->  { "<id>": { "w", "h", "widths": [...], "v": "<hash>" } }
// main.js reads the manifest and lets the browser pick the right width (srcset), so phones never download 4K.
// Unchanged originals are skipped; outputs of deleted originals are removed.
import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile, mkdir, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = path.join(ROOT, 'assets', 'photos');
const OUT = path.join(DIR, 'web');
const MANIFEST = path.join(DIR, 'manifest.json');
const WIDTHS = [640, 1280, 1920, 2560, 3840];
const QUALITY = { 640: 76, 1280: 76, 1920: 76, 2560: 74, 3840: 72 };
const ORIGINAL = /^([a-z0-9][a-z0-9-]*)\.(jpe?g|png)$/i;

const readJSON = async (f) => { try { return JSON.parse(await readFile(f, 'utf8')); } catch { return {}; } };

const old = await readJSON(MANIFEST);
const next = {};
await mkdir(OUT, { recursive: true });

const files = (await readdir(DIR)).filter((f) => ORIGINAL.test(f)).sort();
for (const file of files) {
  const id = file.match(ORIGINAL)[1].toLowerCase();
  if (next[id]) { console.warn(`skip ${file}: another original already uses the id "${id}"`); continue; }
  const buf = await readFile(path.join(DIR, file));
  const v = createHash('sha1').update(buf).digest('hex').slice(0, 8);
  const outputs = await readdir(OUT);
  const done = old[id] && old[id].v === v && old[id].widths.every((w) => outputs.includes(`${id}-${w}.webp`));
  if (done) { next[id] = old[id]; console.log(`unchanged ${id}`); continue; }

  const img = sharp(buf, { failOn: 'none' }).rotate();          // apply the camera's EXIF orientation
  const { width, height } = await img.metadata().then((m) => (m.orientation >= 5 ? { width: m.height, height: m.width } : m));
  const widths = WIDTHS.filter((w) => w <= width);
  if (!widths.length) widths.push(width);                        // small original: keep its own width
  for (const w of widths) {
    await sharp(buf, { failOn: 'none' }).rotate().resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY[w] || 76, effort: 5, smartSubsample: true })
      .toFile(path.join(OUT, `${id}-${w}.webp`));
  }
  // remove widths left over from an earlier, larger original
  for (const f of outputs) {
    const m = f.match(/^(.+)-(\d+)\.webp$/);
    if (m && m[1] === id && !widths.includes(+m[2])) await unlink(path.join(OUT, f));
  }
  next[id] = { w: width, h: height, widths, v };
  console.log(`made ${id}: ${width}×${height} → ${widths.join(', ')}`);
}

// outputs whose original is gone
for (const f of await readdir(OUT)) {
  const m = f.match(/^(.+)-(\d+)\.webp$/);
  if (m && !next[m[1]]) { await unlink(path.join(OUT, f)); console.log(`removed ${f}`); }
}

const sorted = Object.fromEntries(Object.keys(next).sort().map((k) => [k, next[k]]));
await writeFile(MANIFEST, JSON.stringify(sorted, null, 1) + '\n');
console.log(`manifest: ${Object.keys(sorted).length} photo(s)`);
