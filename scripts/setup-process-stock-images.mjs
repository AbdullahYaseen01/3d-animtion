/**
 * Downloads HQ shoe-only stock photos for Process pipeline cards.
 * Sources: Unsplash + Pexels (free commercial use).
 */
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = path.join(root, 'public', 'process')

const PROCESS_IMAGES = [
  {
    id: 'concept',
    url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1920&q=90&auto=format&fit=crop',
  },
  {
    id: 'modeling',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1920&q=90&auto=format&fit=crop',
  },
  {
    id: 'texturing',
    url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=1920&q=90&auto=format&fit=crop',
  },
  {
    id: 'rigging',
    url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 'animation',
    url: 'https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg?auto=compress&cs=tinysrgb&w=1920',
  },
  {
    id: 'render',
    url: 'https://images.pexels.com/photos/336372/pexels-photo-336372.jpeg?auto=compress&cs=tinysrgb&w=1920',
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
const tmpDir = path.join(root, 'scripts', '.tmp-process')
fs.mkdirSync(tmpDir, { recursive: true })

console.log('Downloading HQ shoe-only images...\n')

const manifestProcess = {}

for (const item of PROCESS_IMAGES) {
  try {
    const tmp = path.join(tmpDir, `${item.id}.jpg`)
    const dest = path.join(outDir, `${item.id}.webp`)
    process.stdout.write(`→ ${item.id}... `)
    fs.writeFileSync(tmp, await download(item.url))
    if (toWebp(tmp, dest)) {
      manifestProcess[item.id] = `/process/${item.id}.webp`
      console.log(`✓ ${Math.round(fs.statSync(dest).size / 1024)} KB`)
    } else {
      console.log('✗ convert failed')
    }
  } catch (err) {
    console.log(`✗ ${err.message}`)
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
fs.rmSync(tmpDir, { recursive: true, force: true })
console.log('\nDone — shoe-only images in public/process/')
