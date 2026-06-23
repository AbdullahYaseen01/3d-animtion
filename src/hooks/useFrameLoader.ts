import { useCallback, type RefObject } from 'react'
import framesManifest from '../data/framesManifest.json'

const { totalFrames, pattern, padLength } = framesManifest

const imageCache = new Map<number, HTMLImageElement>()
const loadingSet = new Set<number>()
let preloadAllPromise: Promise<void> | null = null
let lastDrawnFrame = -1

function framePath(index: number): string {
  const num = String(index).padStart(padLength, '0')
  return pattern.replace('%04d', num)
}

function loadFrame(index: number): Promise<HTMLImageElement> {
  const clamped = Math.min(Math.max(1, index), totalFrames)
  const cached = imageCache.get(clamped)
  if (cached?.complete) return Promise.resolve(cached)
  if (loadingSet.has(clamped)) {
    return new Promise((resolve, reject) => {
      const check = () => {
        const img = imageCache.get(clamped)
        if (img?.complete) resolve(img)
        else if (!loadingSet.has(clamped)) reject(new Error('load failed'))
        else requestAnimationFrame(check)
      }
      check()
    })
  }

  loadingSet.add(clamped)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.decoding = 'async'
    img.src = framePath(clamped)
    img.onload = () => {
      imageCache.set(clamped, img)
      loadingSet.delete(clamped)
      resolve(img)
    }
    img.onerror = () => {
      loadingSet.delete(clamped)
      reject(new Error(`frame ${clamped}`))
    }
  })
}

export function preloadCriticalFrames(count = 16): Promise<void> {
  const step = Math.max(1, Math.floor(totalFrames / count))
  const indices = Array.from({ length: count }, (_, i) =>
    Math.min(1 + i * step, totalFrames),
  )
  return Promise.all(indices.map(loadFrame)).then(() => undefined)
}

export function preloadRange(center: number, radius = 12): void {
  const start = Math.max(1, center - radius)
  const end = Math.min(totalFrames, center + radius)
  for (let i = start; i <= end; i++) {
    if (!imageCache.has(i) && !loadingSet.has(i)) {
      loadFrame(i).catch(() => {})
    }
  }
}

export function preloadAllFrames(): Promise<void> {
  if (preloadAllPromise) return preloadAllPromise

  preloadAllPromise = (async () => {
    const batchSize = 8
    for (let i = 1; i <= totalFrames; i += batchSize) {
      const batch = Array.from(
        { length: Math.min(batchSize, totalFrames - i + 1) },
        (_, j) => loadFrame(i + j),
      )
      await Promise.allSettled(batch)
      await new Promise((r) => setTimeout(r, 0))
    }
  })()

  return preloadAllPromise
}

export function getCachedFrame(index: number): HTMLImageElement | undefined {
  return imageCache.get(Math.min(Math.max(1, Math.round(index)), totalFrames))
}

export function drawFrameToCanvas(
  canvas: HTMLCanvasElement,
  frameIndex: number,
): boolean {
  const idx = Math.min(Math.max(1, Math.round(frameIndex)), totalFrames)
  if (idx === lastDrawnFrame) return true

  const img = imageCache.get(idx)
  if (!img?.complete) {
    preloadRange(idx, 8)
    return false
  }

  const ctx = canvas.getContext('2d', { alpha: false })
  if (!ctx) return false

  const rect = canvas.getBoundingClientRect()
  const scale = Math.max(rect.width / img.width, rect.height / img.height)
  const w = img.width * scale
  const h = img.height * scale
  const x = (rect.width - w) / 2
  const y = (rect.height - h) / 2

  ctx.fillStyle = '#050505'
  ctx.fillRect(0, 0, rect.width, rect.height)
  ctx.drawImage(img, x, y, w, h)

  lastDrawnFrame = idx
  return true
}

export function resetDrawCache(): void {
  lastDrawnFrame = -1
}

export function useDrawFrame(canvasRef: RefObject<HTMLCanvasElement | null>) {
  return useCallback((frameIndex: number) => {
    const canvas = canvasRef.current
    if (!canvas) return false
    return drawFrameToCanvas(canvas, frameIndex)
  }, [canvasRef])
}

export { totalFrames, loadFrame, framePath }
