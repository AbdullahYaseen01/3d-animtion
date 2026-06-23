import { useEffect, useRef } from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'

interface HeroVideoBackgroundProps {
  scrollProgress: MotionValue<number>
}

export function HeroVideoBackground({ scrollProgress }: HeroVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const opacity = useTransform(scrollProgress, [0, 0.12], [1, 0.35])
  const y = useTransform(scrollProgress, [0, 0.12], ['0%', '-8%'])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const play = () => {
      video.playbackRate = 0.85
      video.play().catch(() => {})
    }

    video.addEventListener('loadeddata', play)
    if (video.readyState >= 2) play()

    return () => video.removeEventListener('loadeddata', play)
  }, [])

  return (
    <motion.div className="hero-video-bg" style={{ opacity, y }} aria-hidden="true">
      <video
        ref={videoRef}
        className="hero-video"
        src="/hero-loop.mp4"
        poster="/process/render.webp"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="hero-video-shine" aria-hidden="true" />
    </motion.div>
  )
}
