/**
 * Downloads 4 visually distinct HQ sneaker photos for the Features section.
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
    id: 'materials',
    label: 'Green Nike product — premium build',
    url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1920&q=92&auto=format&fit=crop',
  },
  {
    id: 'comfort',
    label: 'Lifestyle pair on feet',
    url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=1920&q=92&auto=format&fit=crop',
  },
  {
    id: 'performance',
    label: 'Bold orange athletic sneaker',
    url: 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 'style',
    label: 'Yellow canvas street classic',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&q=92&auto=format&fit=crop',
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

console.log('Downloading 4 distinct HQ shoe images for Features section...\n')

const manifestFeatures = {}

for (const item of FEATURE_IMAGES) {
  try {
    const tmp = path.join(tmpDir, `${item.id}.jpg`)
    const dest = path.join(outDir, `${item.id}.webp`)
    process.stdout.write(`→ ${item.id} (${item.label})... `)
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
let existing = {}
if (fs.existsSync(manifestPath)) {
  existing = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
}

fs.writeFileSync(
  manifestPath,
  JSON.stringify({ ...existing, features: manifestFeatures }, null, 2) + '\n',
)
fs.rmSync(tmpDir, { recursive: true, force: true })
console.log('\nDone — 4 unique feature images saved to public/features/')
