import { lazy, Suspense, useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Navigation } from './components/Navigation'
import { Footer } from './components/Footer'
import { LoadingScreen } from './components/LoadingScreen'
import { useLoadingProgress } from './hooks/useLoadingProgress'

const HeroSection = lazy(() =>
  import('./components/HeroSection').then((m) => ({ default: m.HeroSection })),
)
const ScrollVideoSection = lazy(() =>
  import('./components/ScrollVideoSection').then((m) => ({ default: m.ScrollVideoSection })),
)
const HorizontalScrollSection = lazy(() =>
  import('./components/HorizontalScrollSection').then((m) => ({ default: m.HorizontalScrollSection })),
)
const FeatureSection = lazy(() =>
  import('./components/FeatureSection').then((m) => ({ default: m.FeatureSection })),
)
const CTASection = lazy(() =>
  import('./components/CTASection').then((m) => ({ default: m.CTASection })),
)

gsap.registerPlugin(ScrollTrigger)

function SectionFallback() {
  return <div className="section-fallback" aria-hidden="true" />
}

function App() {
  const { progress, isReady } = useLoadingProgress()

  useEffect(() => {
    if (!isReady) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    })

    lenis.on('scroll', ScrollTrigger.update)

    let rafId: number
    const raf = (time: number) => {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
    }
  }, [isReady])

  return (
    <>
      {!isReady && <LoadingScreen progress={progress} />}
      <div className={`app ${isReady ? 'app--ready' : ''}`}>
        <div className="grain" aria-hidden="true" />
        <Navigation />
        <main>
          <Suspense fallback={<SectionFallback />}>
            <HeroSection />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <ScrollVideoSection />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <HorizontalScrollSection />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <FeatureSection />
          </Suspense>
          <Suspense fallback={<SectionFallback />}>
            <CTASection />
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  )
}

export default App
