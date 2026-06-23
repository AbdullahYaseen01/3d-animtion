/**
 * Downloads HQ sneaker photos for the scroll gallery showcase section.
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
  { id: 'slide-1', url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&q=90&auto=format&fit=crop' },
  { id: 'slide-2', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=90&auto=format&fit=crop' },
  { id: 'slide-3', url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1920&q=90&auto=format&fit=crop' },
  { id: 'slide-4', url: 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=1920' },
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
    ['-y', '-i', input, '-vf', 'scale=1920:-2', '-c:v', 'libwebp', '-quality', '92', dest],
    { stdio: 'pipe' },
  ).status === 0
}

fs.mkdirSync(outDir, { recursive: true })
const tmp = path.join(root, 'scripts', '.tmp-showcase')
fs.mkdirSync(tmp, { recursive: true })

const galleryPaths = []

for (const item of GALLERY) {
  const dest = path.join(outDir, `${item.id}.webp`)
  process.stdout.write(`${item.id}... `)
  try {
    fs.writeFileSync(path.join(tmp, `${item.id}.jpg`), await download(item.url))
    if (toWebp(path.join(tmp, `${item.id}.jpg`), dest)) {
      galleryPaths.push(`/showcase/${item.id}.webp`)
      console.log('✓')
    } else console.log('✗')
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
console.log('Done — gallery images in public/showcase/')
