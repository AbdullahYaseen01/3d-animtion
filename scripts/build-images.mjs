/**
 * Generates responsive AVIF + WebP variants from assets-src/generated/*.png
 * into public/images/, a social share image, and the compressed hero video.
 * Run: npm run images
 * Campaign stills only: node scripts/build-images.mjs --campaign
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const campaignOnly = process.argv.includes('--campaign')

/**
 * Widths must match HERO_WIDTHS and CATEGORY_WIDTHS in src/campaign/styleInMotion.ts.
 * Each category still also becomes a 1200×630 share image at public/og/collection-<name>.jpg,
 * and the hero becomes public/og/home.jpg.
 */
async function emitCampaign() {
  const dir = path.join(root, 'public', 'campaign')
  if (!fs.existsSync(dir)) return
  const ogDir = path.join(root, 'public', 'og')
  fs.mkdirSync(ogDir, { recursive: true })
  const heroWidths = [480, 768, 1200, 1600, 1910]
  const thumbWidths = [320, 480, 800, 1200]
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.png') && !/-\d+\.png$/.test(f))) {
    const name = path.basename(file, '.png')
    const input = path.join(dir, file)
    const meta = await sharp(input).metadata()
    const widths = (name.startsWith('hero-') ? heroWidths : thumbWidths).filter((w) => w <= (meta.width ?? 0))
    const avifQuality = name.startsWith('hero-') ? 62 : 56
    const webpQuality = name.startsWith('hero-') ? 82 : 78
    for (const w of widths) {
      const base = path.join(dir, `${name}-${w}`)
      await sharp(input).resize({ width: w, withoutEnlargement: true }).avif({ quality: avifQuality, effort: 5 }).toFile(`${base}.avif`)
      await sharp(input).resize({ width: w, withoutEnlargement: true }).webp({ quality: webpQuality }).toFile(`${base}.webp`)
    }
    if (name.startsWith('category-') || name.startsWith('hero-')) {
      const og = path.join(ogDir, name.startsWith('hero-') ? 'home.jpg' : `${name.replace(/^category-/, 'collection-')}.jpg`)
      await sharp(input).resize({ width: 1200, height: 630, fit: 'cover', position: 'attention' }).jpeg({ quality: 80, mozjpeg: true }).toFile(og)
    }
    process.stdout.write(`✓ campaign/${name} (${widths.join(', ')})\n`)
  }
}

if (campaignOnly) {
  await emitCampaign()
  process.exit(0)
}
const srcDir = path.join(root, 'assets-src', 'generated')
const outDir = path.join(root, 'public', 'images')

const PRODUCT_WIDTHS = [400, 700, 1024]
const EDITORIAL_WIDTHS = [480, 768, 1024]

fs.mkdirSync(path.join(outDir, 'products'), { recursive: true })
fs.mkdirSync(path.join(outDir, 'editorial'), { recursive: true })

const manifest = {}

async function emit(file, group, widths) {
  const name = path.basename(file, '.png')
  const input = sharp(path.join(srcDir, file))
  const meta = await input.metadata()
  const { data } = await sharp(path.join(srcDir, file))
    .extract({ left: 8, top: 8, width: 40, height: 40 })
    .resize(1, 1)
    .raw()
    .toBuffer({ resolveWithObject: true })
  const bg = `#${[...data.subarray(0, 3)].map((v) => v.toString(16).padStart(2, '0')).join('')}`

  const usable = widths.filter((w) => w <= meta.width)
  for (const w of usable) {
    const base = path.join(outDir, group, `${name}-${w}`)
    await sharp(path.join(srcDir, file)).resize({ width: w }).avif({ quality: 55, effort: 6 }).toFile(`${base}.avif`)
    await sharp(path.join(srcDir, file)).resize({ width: w }).webp({ quality: 78 }).toFile(`${base}.webp`)
  }
  manifest[name] = { w: meta.width, h: meta.height, widths: usable, bg }
  process.stdout.write(`✓ ${group}/${name} (${usable.join(', ')}) bg ${bg}\n`)
}

for (const file of fs.readdirSync(srcDir).filter((f) => f.endsWith('.png'))) {
  const isEditorial = file.startsWith('editorial-')
  await emit(file, isEditorial ? 'editorial' : 'products', isEditorial ? EDITORIAL_WIDTHS : PRODUCT_WIDTHS)
}

// 1200x630 Open Graph image: flagship shoe on the brand surface.
const shoe = await sharp(path.join(srcDir, 'stride-chalk-ember-side.png')).resize({ height: 630 }).toBuffer()
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#EFE8DE' } })
  .composite([{ input: shoe, left: Math.round((1200 - 630) / 2), top: 0 }])
  .jpeg({ quality: 82 })
  .toFile(path.join(root, 'public', 'og-default.jpg'))
console.log('✓ og-default.jpg')

fs.writeFileSync(path.join(root, 'src', 'data', 'imageManifest.json'), JSON.stringify(manifest, null, 2) + '\n')

// Campaign film: only the Stride Runner segment (3–7 s), no audio, faststart, plus a poster frame.
// The left 13% is cropped away: the source clip carries a third-party logo watermark in its bottom-left corner.
const video = path.join(root, 'assets-src', 'hero-loop.mp4')
if (ffmpegPath && fs.existsSync(video)) {
  const mediaDir = path.join(root, 'public', 'media')
  fs.mkdirSync(mediaDir, { recursive: true })
  const run = (args) => spawnSync(ffmpegPath, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { stdio: 'inherit' })
  const frame = 'crop=trunc(iw*0.87/2)*2:ih:trunc(iw*0.13):0,scale=1120:-2'
  run(['-ss', '3', '-t', '4', '-i', video, '-an', '-vf', frame, '-c:v', 'libx264', '-crf', '27', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(mediaDir, 'stride-film.mp4')])
  run(['-ss', '4.2', '-i', video, '-frames:v', '1', '-vf', frame, path.join(mediaDir, 'stride-film-poster.png')])
  await sharp(path.join(mediaDir, 'stride-film-poster.png')).webp({ quality: 72 }).toFile(path.join(mediaDir, 'stride-film-poster.webp'))
  await sharp(path.join(mediaDir, 'stride-film-poster.png')).avif({ quality: 50 }).toFile(path.join(mediaDir, 'stride-film-poster.avif'))
  fs.rmSync(path.join(mediaDir, 'stride-film-poster.png'))
  console.log(`✓ media/stride-film.mp4 ${Math.round(fs.statSync(path.join(mediaDir, 'stride-film.mp4')).size / 1024)} KB`)
}

await emitCampaign()
