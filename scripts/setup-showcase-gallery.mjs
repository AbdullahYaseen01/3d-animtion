/**
 * Downloads 4 visually distinct HQ sneaker photos for the scroll gallery.
 * Each slide uses a different style, color, and composition.
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public', 'showcase')

const GALLERY = [
  {
    id: 'slide-1',
    label: 'Yellow canvas lifestyle shot',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&q=92&auto=format&fit=crop',
  },
  {
    id: 'slide-2',
    label: 'Colorful sneakers on bright background',
    url: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 'slide-3',
    label: 'Clean white product shot',
    url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 'slide-4',
    label: 'Bold orange performance sneaker',
    url: 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
]

if (!ffmpegPath) process.exit(1)

async function download(url) {
  const res = await fetch(url, { redirect: 'follow' })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return Buffer.from(await res.arrayBuffer())
}

function toWebp(input, dest) {
  return spawnSync(
    ffmpegPath,
    ['-y', '-i', input, '-vf', 'scale=1920:-2', '-c:v', 'libwebp', '-quality', '93', dest],
    { stdio: 'pipe' },
  ).status === 0
}

fs.mkdirSync(outDir, { recursive: true })
const tmp = path.join(root, 'scripts', '.tmp-showcase')
fs.mkdirSync(tmp, { recursive: true })

const galleryPaths = []

console.log('Downloading 4 distinct HQ gallery images...\n')

for (const item of GALLERY) {
  const dest = path.join(outDir, `${item.id}.webp`)
  process.stdout.write(`→ ${item.id} (${item.label})... `)
  try {
    fs.writeFileSync(path.join(tmp, `${item.id}.jpg`), await download(item.url))
    if (toWebp(path.join(tmp, `${item.id}.jpg`), dest)) {
      galleryPaths.push(`/showcase/${item.id}.webp`)
      console.log(`✓ ${Math.round(fs.statSync(dest).size / 1024)} KB`)
    } else console.log('✗ convert failed')
  } catch (e) {
    console.log(`✗ ${e.message}`)
  }
}

const manifestPath = path.join(root, 'src', 'data', 'showcaseImages.json')
const existing = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {}

fs.writeFileSync(
  manifestPath,
  JSON.stringify({ ...existing, gallery: galleryPaths }, null, 2) + '\n',
)
fs.rmSync(tmp, { recursive: true, force: true })
console.log('\nDone — 4 unique gallery images saved.')
