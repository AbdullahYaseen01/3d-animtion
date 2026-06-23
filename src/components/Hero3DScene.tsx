import { Suspense, useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, useGLTF, Environment, ContactShadows, Center } from '@react-three/drei'
import { easing } from 'maath'
import * as THREE from 'three'
import type { MotionValue } from 'framer-motion'
import { useMotionValueEvent } from 'framer-motion'

interface Hero3DSceneProps {
  scrollProgress: MotionValue<number>
}

function enhanceMaterials(object: THREE.Object3D) {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return
    child.castShadow = true
    child.receiveShadow = true
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    materials.forEach((mat) => {
      if (mat instanceof THREE.MeshStandardMaterial) {
        mat.envMapIntensity = 2
        mat.metalness = Math.min(mat.metalness ?? 0.3, 0.45)
        mat.roughness = Math.max(mat.roughness ?? 0.5, 0.35)
        mat.needsUpdate = true
      }
    })
  })
}

function HeroShoeModel({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const groupRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF('/models/shoe.glb')

  const model = useMemo(() => {
    const clone = scene.clone(true)
    enhanceMaterials(clone)
    return clone
  }, [scene])

  const mouse = useRef(new THREE.Vector2())

  useFrame(({ clock, pointer }, delta) => {
    if (!groupRef.current) return
    easing.damp2(mouse.current, [pointer.x * 0.4, pointer.y * 0.25], 0.2, delta)

    const t = clock.elapsedTime
    const scroll = scrollRef.current

    groupRef.current.rotation.y = t * 0.25 + mouse.current.x + scroll * 0.4
    groupRef.current.rotation.x = 0.25 + mouse.current.y + scroll * 0.15
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.06 - scroll * 0.3
  })

  return (
    <group ref={groupRef} rotation={[0.2, -0.5, 0]}>
      <Center>
        <primitive object={model} scale={2.8} />
      </Center>
    </group>
  )
}

function CameraRig({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  const { camera } = useThree()

  useFrame((_, delta) => {
    const scroll = scrollRef.current
    easing.damp(camera.position, 'z', 4.2 + scroll * 1.5, 0.25, delta)
    easing.damp(camera.position, 'y', 0.05 - scroll * 0.2, 0.25, delta)
    camera.lookAt(0, 0, 0)
  })

  return null
}

function SceneContent({ scrollRef }: { scrollRef: React.MutableRefObject<number> }) {
  return (
    <>
      <CameraRig scrollRef={scrollRef} />

      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-5, 3, -3]} intensity={1.2} color="#c9a962" />
      <pointLight position={[0, 4, 3]} intensity={2} color="#fff5e6" distance={15} />
      <pointLight position={[-3, -1, 4]} intensity={1.5} color="#ff9040" distance={12} />
      <spotLight
        position={[0, 8, 2]}
        angle={0.45}
        penumbra={0.6}
        intensity={1.8}
        color="#ffffff"
        castShadow
      />

      <Environment preset="studio" />

      <Stars radius={50} depth={30} count={600} factor={2.5} saturation={0} fade speed={0.2} />

      <Suspense fallback={null}>
        <HeroShoeModel scrollRef={scrollRef} />
      </Suspense>

      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.65}
        scale={10}
        blur={2.5}
        far={4}
      />
    </>
  )
}

export function Hero3DScene({ scrollProgress }: Hero3DSceneProps) {
  const scrollRef = useRef(0)

  useMotionValueEvent(scrollProgress, 'change', (v) => {
    scrollRef.current = v
  })

  return (
    <div className="hero-3d-canvas">
      <Canvas
        camera={{ position: [0, 0.05, 4.2], fov: 38 }}
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <SceneContent scrollRef={scrollRef} />
      </Canvas>
    </div>
  )
}

useGLTF.preload('/models/shoe.glb')
