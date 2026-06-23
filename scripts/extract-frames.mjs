import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const videoPath = path.join(root, 'public', 'shoe-animation.mp4')
const framesDir = path.join(root, 'public', 'frames')
const manifestPath = path.join(root, 'src', 'data', 'framesManifest.json')

const FPS = 24
const MAX_FRAMES = 120

if (!ffmpegPath) {
  console.error('ffmpeg-static binary not found')
  process.exit(1)
}

if (!fs.existsSync(videoPath)) {
  console.error(`Video not found: ${videoPath}`)
  process.exit(1)
}

fs.mkdirSync(framesDir, { recursive: true })
fs.mkdirSync(path.dirname(manifestPath), { recursive: true })

const existing = fs.readdirSync(framesDir).filter((f) => f.endsWith('.png'))
if (existing.length > 0) {
  console.log(`Clearing ${existing.length} existing frames...`)
  for (const file of existing) {
    fs.unlinkSync(path.join(framesDir, file))
  }
}

console.log('Probing video duration...')
const probe = spawnSync(
  ffmpegPath,
  ['-i', videoPath, '-f', 'null', '-'],
  { encoding: 'utf8' },
)

const durationMatch = probe.stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/)
let duration = 5
if (durationMatch) {
  const hours = Number(durationMatch[1])
  const minutes = Number(durationMatch[2])
  const seconds = Number(durationMatch[3])
  duration = hours * 3600 + minutes * 60 + seconds
}

const totalFrames = Math.min(MAX_FRAMES, Math.max(1, Math.round(duration * FPS)))
console.log(`Duration: ${duration.toFixed(2)}s → extracting ${totalFrames} frames at ${FPS}fps`)

const outputPattern = path.join(framesDir, 'frame_%04d.png')

const extract = spawnSync(
  ffmpegPath,
  [
    '-y',
    '-i', videoPath,
    '-vf', `fps=${FPS},scale=1280:-2`,
    '-frames:v', String(totalFrames),
    outputPattern,
  ],
  { encoding: 'utf8', stdio: 'pipe' },
)

if (extract.status !== 0) {
  console.error(extract.stderr)
  process.exit(extract.status ?? 1)
}

const frames = fs
  .readdirSync(framesDir)
  .filter((f) => f.startsWith('frame_') && f.endsWith('.png'))
  .sort()

const manifest = {
  fps: FPS,
  totalFrames: frames.length,
  pattern: '/frames/frame_%04d.png',
  padLength: 4,
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))

console.log(`Done — ${frames.length} PNG frames saved to public/frames/`)
console.log(`Manifest written to src/data/framesManifest.json`)
