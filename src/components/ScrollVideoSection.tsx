import { useEffect, useRef, useState } from 'react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useScroll, useTransform } from 'framer-motion'
import './ScrollVideoSection.css'

const VIDEO_SRC = '/hero-loop.mp4'

export function ScrollVideoSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const topOpacity = useTransform(scrollYProgress, [0, 0.12, 0.3], [1, 1, 0])
  const bottomOpacity = useTransform(scrollYProgress, [0, 0.12, 0.3], [1, 1, 0])
  const topY = useTransform(scrollYProgress, [0, 0.3], [0, -40])
  const bottomY = useTransform(scrollYProgress, [0, 0.3], [0, 30])
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])
  const videoY = useTransform(scrollYProgress, [0, 1], ['0%', '-5%'])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onReady = () => setLoaded(true)
    video.addEventListener('canplaythrough', onReady)
    video.addEventListener('loadeddata', onReady)
    if (video.readyState >= 2) onReady()

    return () => {
      video.removeEventListener('canplaythrough', onReady)
      video.removeEventListener('loadeddata', onReady)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return

    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return

    const play = () => {
      video.playbackRate = 1
      video.loop = true
      video.play().catch(() => {})
    }

    play()

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=130%',
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onEnter: play,
      onEnterBack: play,
      onLeave: () => video.pause(),
      onLeaveBack: () => video.pause(),
    })

    return () => {
      st.kill()
      video.pause()
    }
  }, [loaded])

  return (
    <section id="showcase" className="scroll-video" ref={sectionRef}>
      <div className="scroll-video-stage">
        <motion.div
          className="scroll-video-bg"
          style={{ scale: videoScale, y: videoY }}
          aria-hidden="true"
        >
          <video
            ref={videoRef}
            className="scroll-video-player"
            src={VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            poster="/process/render.webp"
          />
          <div className="scroll-video-shine" aria-hidden="true" />
        </motion.div>

        <div className="scroll-video-vignette" aria-hidden="true" />

        {!loaded && (
          <div className="scroll-video-loading">
            <div className="loading-ring">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="loading-ring-bg" />
                <circle cx="50" cy="50" r="45" className="loading-ring-fill" />
              </svg>
            </div>
          </div>
        )}

        <motion.div className="scroll-video-top" style={{ opacity: topOpacity, y: topY }}>
          <span className="section-label">The Collection</span>
          <h2 className="scroll-video-headline scroll-video-headline--top">Every Angle</h2>
        </motion.div>

        <motion.div className="scroll-video-bottom" style={{ opacity: bottomOpacity, y: bottomY }}>
          <h2 className="scroll-video-headline scroll-video-headline--bottom">Up Close</h2>
          <p className="scroll-video-subtitle">
            Premium craftsmanship in motion — smooth, cinematic, built for the streets.
          </p>
          <div className="scroll-video-indicator">
            <span>Keep scrolling</span>
            <motion.div
              className="scroll-video-line"
              animate={{ scaleY: [0, 1, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
