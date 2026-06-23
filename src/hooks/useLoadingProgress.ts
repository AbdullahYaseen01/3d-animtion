import { useEffect, useState } from 'react'

export function useLoadingProgress() {
  const [progress, setProgress] = useState(0)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const boot = async () => {
      setProgress(20)

      await new Promise<void>((resolve) => {
        const video = document.createElement('video')
        video.src = '/hero-loop.mp4'
        video.preload = 'auto'
        video.muted = true
        const done = () => resolve()
        video.addEventListener('canplaythrough', done)
        video.addEventListener('error', done)
        video.load()
      })

      if (cancelled) return
      setProgress(100)
      setTimeout(() => setIsReady(true), 200)
    }

    boot()

    const fallback = setTimeout(() => {
      if (!cancelled) setIsReady(true)
    }, 4000)

    return () => {
      cancelled = true
      clearTimeout(fallback)
    }
  }, [])

  return { progress, isReady }
}
