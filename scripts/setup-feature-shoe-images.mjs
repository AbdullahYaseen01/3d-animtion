/**
 * Downloads HQ shoe-only photos for the Features section cards.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public', 'features')

const FEATURE_IMAGES = [
  {
    id: 'photoreal',
    url: 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 'animation',
    url: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 'interactive',
    url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 'scroll-sync',
    url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
]

if (!ffmpegPath) {
  console.error('ffmpeg-static not found')
  process.exit(1)
}

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function toWebp(inputPath, destPath) {
  const result = spawnSync(
    ffmpegPath,
    ['-y', '-i', inputPath, '-vf', 'scale=1920:-2', '-c:v', 'libwebp', '-quality', '92', destPath],
    { encoding: 'utf8', stdio: 'pipe' },
  )
  return result.status === 0
}

fs.mkdirSync(outDir, { recursive: true })
const tmpDir = path.join(root, 'scripts', '.tmp-features')
fs.mkdirSync(tmpDir, { recursive: true })

console.log('Downloading HQ shoe images for Features section...\n')

const manifestFeatures = {}

for (const item of FEATURE_IMAGES) {
  try {
    const tmp = path.join(tmpDir, `${item.id}.jpg`)
    const dest = path.join(outDir, `${item.id}.webp`)
    process.stdout.write(`→ ${item.id}... `)
    fs.writeFileSync(tmp, await download(item.url))
    if (toWebp(tmp, dest)) {
      manifestFeatures[item.id] = `/features/${item.id}.webp`
      console.log(`✓ ${Math.round(fs.statSync(dest).size / 1024)} KB`)
    } else {
      console.log('✗ convert failed')
    }
  } catch (err) {
    console.log(`✗ ${err.message}`)
  }
}

const manifestPath = path.join(root, 'src', 'data', 'showcaseImages.json')
let existing = { process: {} }
if (fs.existsSync(manifestPath)) {
  existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
}

fs.writeFileSync(
  manifestPath,
  JSON.stringify({ process: existing.process ?? {}, features: manifestFeatures }, null, 2) + '\n',
)
fs.rmSync(tmpDir, { recursive: true, force: true })
console.log('\nDone — shoe images saved to public/features/')
