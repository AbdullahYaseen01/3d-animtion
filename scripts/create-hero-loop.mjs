import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const src = path.join(root, 'public', 'shoe-animation.mp4')
const dest = path.join(root, 'public', 'hero-loop.mp4')

const START = 0
const DURATION = 7

if (!ffmpegPath) {
  console.error('ffmpeg-static not found')
  process.exit(1)
}

if (!fs.existsSync(src)) {
  console.error('Source video not found:', src)
  process.exit(1)
}

console.log(`Creating hero loop (${DURATION}s, high quality)...`)

const result = spawnSync(
  ffmpegPath,
  [
    '-y',
    '-ss', String(START),
    '-i', src,
    '-t', String(DURATION),
    '-vf', 'scale=1920:-2',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-an',
    dest,
  ],
  { encoding: 'utf8', stdio: 'pipe' },
)

if (result.status !== 0) {
  console.error(result.stderr)
  process.exit(result.status ?? 1)
}

const sizeMB = (fs.statSync(dest).size / 1024 / 1024).toFixed(2)
console.log(`Done — hero-loop.mp4 (${sizeMB} MB)`)
