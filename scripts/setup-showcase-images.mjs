import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const videoPath = path.join(root, 'public', 'shoe-animation.mp4')
const FPS = 24

/* Unique early frames — clear, assembled shoe at different angles */
const PROCESS = [
  { id: 'concept', frame: 8 },
  { id: 'modeling', frame: 12 },
  { id: 'texturing', frame: 16 },
  { id: 'rigging', frame: 20 },
  { id: 'animation', frame: 24 },
  { id: 'render', frame: 30 },
]

const FEATURES = [
  { id: 'photoreal', frame: 28 },
  { id: 'animation', frame: 22 },
  { id: 'interactive', frame: 14 },
  { id: 'scroll-sync', frame: 18 },
]

if (!ffmpegPath) {
  console.error('ffmpeg-static not found')
  process.exit(1)
}

if (!fs.existsSync(videoPath)) {
  console.error('Video not found:', videoPath)
  process.exit(1)
}

function frameToSeconds(frame) {
  return Math.max(0, (frame - 1) / FPS)
}

function extractHQ(frameNum, destPath) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  const ss = frameToSeconds(frameNum)

  const result = spawnSync(
    ffmpegPath,
    [
      '-y',
      '-ss', String(ss),
      '-i', videoPath,
      '-frames:v', '1',
      '-vf', 'scale=1920:-2,eq=brightness=0.1:contrast=1.2:saturation=1.22,unsharp=7:7:1.4:7:7:0.6',
      '-c:v', 'libwebp',
      '-quality', '94',
      destPath,
    ],
    { encoding: 'utf8', stdio: 'pipe' },
  )

  if (result.status !== 0) {
    console.error(result.stderr?.slice(-300))
    return false
  }
  return true
}

console.log('Extracting HQ 1920px images from source video...\n')

for (const step of PROCESS) {
  const dest = path.join(root, 'public', 'process', `${step.id}.webp`)
  if (extractHQ(step.frame, dest)) {
    const kb = Math.round(fs.statSync(dest).size / 1024)
    console.log(`✓ process/${step.id}.webp ← frame ${step.frame} (${kb} KB)`)
  }
}

for (const feat of FEATURES) {
  const dest = path.join(root, 'public', 'features', `${feat.id}.webp`)
  if (extractHQ(feat.frame, dest)) {
    const kb = Math.round(fs.statSync(dest).size / 1024)
    console.log(`✓ features/${feat.id}.webp ← frame ${feat.frame} (${kb} KB)`)
  }
}

const manifest = {
  process: Object.fromEntries(PROCESS.map((p) => [p.id, `/process/${p.id}.webp`])),
  features: Object.fromEntries(FEATURES.map((f) => [f.id, `/features/${f.id}.webp`])),
}

fs.writeFileSync(
  path.join(root, 'src', 'data', 'showcaseImages.json'),
  JSON.stringify(manifest, null, 2),
)

console.log('\nDone — unique HQ images at 1920px.')
