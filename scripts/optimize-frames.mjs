import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const framesDir = path.join(root, 'public', 'frames')
const manifestPath = path.join(root, 'src', 'data', 'framesManifest.json')

const WIDTH = 960
const QUALITY = 82

if (!ffmpegPath) {
  console.error('ffmpeg-static binary not found')
  process.exit(1)
}

const pngs = fs.readdirSync(framesDir).filter((f) => f.endsWith('.png')).sort()
if (pngs.length === 0) {
  console.error('No PNG frames found. Run npm run extract-frames first.')
  process.exit(1)
}

console.log(`Optimizing ${pngs.length} frames → WebP (${WIDTH}px, q${QUALITY})...`)

let totalBefore = 0
let totalAfter = 0

for (const file of pngs) {
  const src = path.join(framesDir, file)
  const dest = path.join(framesDir, file.replace('.png', '.webp'))

  totalBefore += fs.statSync(src).size

  const result = spawnSync(
    ffmpegPath,
    ['-y', '-i', src, '-vf', `scale=${WIDTH}:-2`, '-c:v', 'libwebp', '-quality', String(QUALITY), dest],
    { encoding: 'utf8', stdio: 'pipe' },
  )

  if (result.status !== 0) {
    console.error(`Failed: ${file}`, result.stderr)
    continue
  }

  totalAfter += fs.statSync(dest).size
  fs.unlinkSync(src)
}

const manifest = {
  fps: 24,
  totalFrames: pngs.length,
  pattern: '/frames/frame_%04d.webp',
  padLength: 4,
  format: 'webp',
  width: WIDTH,
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

const saved = ((1 - totalAfter / totalBefore) * 100).toFixed(1)
console.log(`Done — ${(totalBefore / 1024 / 1024).toFixed(1)}MB → ${(totalAfter / 1024 / 1024).toFixed(1)}MB (${saved}% smaller)`)
