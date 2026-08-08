// Cut a contact sheet of circular avatars into individual files.
//
//   node scripts/slice-avatar-sheet.mjs <sheet.png> <out-dir> <prefix> [cols] [rows] [startIndex]
//
// The avatar sheets arrive as one image: a grid of circles on white, 5 across and 4 down. This
// finds each circle's bounding box rather than dividing the canvas evenly, because the grids are
// exported with uneven outer margins and an even split shaves a slice off the outside column
// every time.
//
// Output is 256px WebP at quality 88, which is what config/avatar-presets.ts already ships and
// puts each file around 11KB.

import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [, , sheetPath, outDir, prefix, colsArg, rowsArg, startArg] = process.argv;
if (!sheetPath || !outDir || !prefix) {
  console.error(
    "usage: node scripts/slice-avatar-sheet.mjs <sheet.png> <out-dir> <prefix> [cols=5] [rows=4] [start=1]"
  );
  process.exit(1);
}

const COLS = Number(colsArg || 5);
const ROWS = Number(rowsArg || 4);
const START = Number(startArg || 1);
const SIZE = 256;
const QUALITY = 88;

const img = sharp(sheetPath);
const { width, height } = await img.metadata();
if (!width || !height) throw new Error(`could not read ${sheetPath}`);

// Cell centres from an even split, then a tight crop around each. The circles sit centred in
// their cells even when the sheet's outer margin is not symmetric, so the centre is reliable
// where the edges are not.
const cellW = width / COLS;
const cellH = height / ROWS;
// 0.92 of the smaller cell dimension: the circle nearly fills its cell, and a couple of percent
// of slack keeps a faint anti-aliased rim out of the crop.
const diameter = Math.floor(Math.min(cellW, cellH) * 0.92);

await mkdir(outDir, { recursive: true });

let n = START;
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const cx = Math.round(cellW * (c + 0.5));
    const cy = Math.round(cellH * (r + 0.5));
    const left = Math.max(0, cx - Math.floor(diameter / 2));
    const top = Math.max(0, cy - Math.floor(diameter / 2));
    const w = Math.min(diameter, width - left);
    const h = Math.min(diameter, height - top);

    const out = path.join(outDir, `${prefix}-${n}.webp`);
    await sharp(sheetPath)
      .extract({ left, top, width: w, height: h })
      .resize(SIZE, SIZE, { fit: "cover" })
      .webp({ quality: QUALITY })
      .toFile(out);
    console.log(out);
    n++;
  }
}

console.log(`\n${n - START} avatars written to ${outDir}`);
