// Make each portrait preset a real circle, with transparency outside it.
//
//   node scripts/round-avatar-presets.mjs [dir=public/avatars/people]
//
// WHY. The presets were sliced out of a contact sheet as SQUARES around each circle, so every
// file is a white square containing a tan circle containing a face. Rendering that inside a CSS
// `rounded-full` container draws a second circle over the first: the two never align exactly, so
// a pale ring shows on one side and the near-white corners (254,254,254) meet the card's pure
// white as a faint straight edge. It reads as a bad crop because two crops are fighting.
//
// This makes the file itself the circle:
//   1. TRIM the white margin, which leaves exactly the coloured disc.
//   2. Square it off, so the disc is not stretched by the resize.
//   3. Punch a circular alpha mask, so everything outside the disc is transparent.
//
// After this the asset is correct on its own. It looks right inside a rounded container, and
// equally right with no CSS cropping at all - which is the treatment the College Agent uses for
// its mascot and the reason this came up.
//
// Idempotent: a file that already has transparent corners is skipped, so a re-run is free.

import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const dir = process.argv[2] || "public/avatars/people";
const SIZE = 256;
const QUALITY = 90;

/** Does this file already have a transparent corner? Then it has been through here. */
async function alreadyRound(file) {
  const img = sharp(file);
  const { hasAlpha } = await img.metadata();
  if (!hasAlpha) return false;
  const { data, info } = await img.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return data[info.channels - 1] === 0; // alpha of the top-left pixel
}

const files = (await readdir(dir)).filter((f) => f.endsWith(".webp")).sort();
let done = 0;
let skipped = 0;

for (const name of files) {
  const file = path.join(dir, name);
  if (await alreadyRound(file)) {
    skipped++;
    continue;
  }

  // Trim the flat border the slice left around the disc. threshold is generous because the
  // sheet's "white" is 254 rather than 255 and carries a little JPEG noise.
  const trimmed = await sharp(file).trim({ threshold: 12 }).toBuffer();

  // Square it before masking, so a disc that trimmed to a slightly oblong box is not squashed
  // into an ellipse by the resize.
  const square = await sharp(trimmed)
    .resize(SIZE, SIZE, { fit: "cover", position: "centre" })
    .toBuffer();

  const mask = Buffer.from(
    `<svg width="${SIZE}" height="${SIZE}"><circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE / 2}" fill="#fff"/></svg>`
  );

  await sharp(square)
    .composite([{ input: mask, blend: "dest-in" }])
    .webp({ quality: QUALITY, alphaQuality: 100 })
    .toFile(file + ".tmp");

  await sharp(file + ".tmp").toFile(file);
  done++;
  process.stdout.write(".");
}

console.log(`\n${done} rounded, ${skipped} already round, in ${dir}`);
