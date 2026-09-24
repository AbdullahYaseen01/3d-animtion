import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui/Icon'

interface NetworkInformation {
  saveData?: boolean
}

/**
 * Lazy campaign video. Never downloads the video for reduced-motion or
 * data-saver visitors (poster only), pauses offscreen, and exposes a
 * visible pause/play control.
 */
export function CampaignFilm() {
  const wrap = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [enabled, setEnabled] = useState(false)
  const [playing, setPlaying] = useState(false)
  const userPaused = useRef(false)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saveData = (navigator as Navigator & { connection?: NetworkInformation }).connection?.saveData
    if (reduce || saveData) return
    const el = wrap.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setEnabled(true)
        const v = video.current
        if (!v) return
        if (entry.isIntersecting && !userPaused.current) v.play().catch(() => setPlaying(false))
        else v.pause()
      },
      { rootMargin: '200px 0px', threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [enabled])

  const toggle = () => {
    const v = video.current
    if (!enabled) {
      userPaused.current = false
      setEnabled(true)
      return
    }
    if (!v) return
    if (v.paused) {
      userPaused.current = false
      v.play().catch(() => {})
    } else {
      userPaused.current = true
      v.pause()
    }
  }

  return (
    <div className="film" ref={wrap}>
      <picture>
        <source type="image/avif" srcSet="/media/stride-film-poster.avif" />
        <img
          className="film__poster"
          src="/media/stride-film-poster.webp"
          alt="Rendered Stride Runner concept in white, charcoal and ember on a dark stage"
          width={1120}
          height={724}
          loading="lazy"
          decoding="async"
        />
      </picture>
      {enabled && (
        <video
          ref={video}
          className="film__video"
          src="/media/stride-film.mp4"
          poster="/media/stride-film-poster.webp"
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          aria-hidden="true"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setEnabled(false)}
        />
      )}
      <button type="button" className="film__toggle" onClick={toggle} aria-label={playing ? 'Pause video' : 'Play video'}>
        <Icon name={playing ? 'pause' : 'play'} size={18} />
      </button>
    </div>
  )
}
