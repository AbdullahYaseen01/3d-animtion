/**
 * Extracts 6 unique HQ shoe frames from shoe-animation.mp4 for the Process section.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const videoPath = path.join(root, 'public', 'shoe-animation.mp4')
const outDir = path.join(root, 'public', 'process')
const FPS = 24

/* Spread across early animation — clear, assembled shoe at different angles */
const PROCESS = [
  { id: 'concept', frame: 6 },
  { id: 'modeling', frame: 10 },
  { id: 'texturing', frame: 14 },
  { id: 'rigging', frame: 18 },
  { id: 'animation', frame: 22 },
  { id: 'render', frame: 28 },
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
      '-vf', [
        'scale=1920:-2',
        'eq=brightness=0.14:contrast=1.25:saturation=1.28',
        'unsharp=7:7:1.6:7:7:0.8',
      ].join(','),
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

fs.mkdirSync(outDir, { recursive: true })
console.log('Extracting HQ shoe frames for Process section...\n')

const manifestProcess = {}

for (const step of PROCESS) {
  const dest = path.join(outDir, `${step.id}.webp`)
  process.stdout.write(`→ ${step.id} (frame ${step.frame})... `)
  if (extractHQ(step.frame, dest)) {
    const kb = Math.round(fs.statSync(dest).size / 1024)
    manifestProcess[step.id] = `/process/${step.id}.webp`
    console.log(`✓ ${kb} KB`)
  } else {
    console.log('✗ failed')
  }
}

const manifestPath = path.join(root, 'src', 'data', 'showcaseImages.json')
let existing = { features: {} }
if (fs.existsSync(manifestPath)) {
  existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
}

fs.writeFileSync(
  manifestPath,
  JSON.stringify({ process: manifestProcess, features: existing.features ?? {} }, null, 2) + '\n',
)

console.log('\nDone — 6 unique shoe images saved to public/process/')
