import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const framesDir = path.join(root, 'public', 'frames')
const processDir = path.join(root, 'public', 'process')

const steps = [
  { id: 'concept', frame: 8 },
  { id: 'modeling', frame: 24 },
  { id: 'texturing', frame: 44 },
  { id: 'rigging', frame: 64 },
  { id: 'animation', frame: 84 },
  { id: 'render', frame: 108 },
]

fs.mkdirSync(processDir, { recursive: true })

for (const step of steps) {
  const num = String(step.frame).padStart(4, '0')
  const webpSrc = path.join(framesDir, `frame_${num}.webp`)
  const pngSrc = path.join(framesDir, `frame_${num}.png`)
  const src = fs.existsSync(webpSrc) ? webpSrc : pngSrc
  const ext = src.endsWith('.webp') ? '.webp' : '.png'
  const dest = path.join(processDir, `${step.id}${ext}`)

  if (!fs.existsSync(src)) {
    console.warn(`Missing frame: ${src}`)
    continue
  }

  fs.copyFileSync(src, dest)
  console.log(`✓ process/${step.id}${ext} ← frame_${num}${ext}`)
}

console.log('Process demo images ready.')
