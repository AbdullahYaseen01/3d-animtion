/**
 * Responsive AVIF and WebP widths for the homepage editorial photos, so phones do not download desktop files.
 * Usage: node scripts/build-editorial-images.mjs   (re-run after replacing a photo in public/images/westora)
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const dir = 'public/images/westora'
const PHOTOS = ['city-edit-model', 'accessories-still-life', 'bags-editorial', 'jewelry-watch']
const WIDTHS = [480, 768, 1080, 1440]

for (const name of PHOTOS) {
  const src = path.join(dir, `${name}.webp`)
  const { width = 0 } = await sharp(src).metadata()
  for (const w of WIDTHS.filter((w) => w < width)) {
    for (const fmt of ['avif', 'webp']) {
      const out = path.join(dir, `${name}-${w}.${fmt}`)
      if (existsSync(out)) continue
      const img = sharp(src).resize({ width: w })
      await (fmt === 'avif' ? img.avif({ quality: 55, effort: 6 }) : img.webp({ quality: 78 })).toFile(out)
      console.log(out)
    }
  }
}
