/**
 * 真 WebGL 半身人 · 样机试跑（产品原型用）
 * - 前台：reception.glb（耳机前台，presence → 点头 / 挥手）
 * - 其他席：程序化胸像（可后换 GLB）
 *
 * 小知 A 程序化形象不在本文件；独立预览见 tools/xiaozhi-a-preview/
 */
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Box3, Vector3, type Bone, type Group, type Object3D } from 'three'
import type { AvatarKind, ExpertPresence } from './ExpertAvatar'

const RECEPTION_GLB = '/expert-avatars/3d/reception.glb?v=2'

type Traits3D = {
  skin: string
  hair: string
  shirt: string
  glasses: boolean
  hairBun: boolean
}

function traitsFromSeed(seed: string, kind: AvatarKind, accent: string): Traits3D {
  if (kind === 'reception') {
    return {
      skin: '#e8c4a0',
      hair: '#1c1917',
      shirt: accent,
      glasses: false,
      hairBun: false,
    }
  }
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  h >>>= 0
  const skins = ['#f3d7bd', '#e8c4a0', '#d4a574', '#c6865a', '#8d5524']
  const hairs = ['#1c1917', '#292524', '#44403c', '#78350f', '#0f172a']
  return {
    skin: skins[h % skins.length]!,
    hair: hairs[(h >>> 3) % hairs.length]!,
    shirt: accent,
    glasses: (h >>> 9) % 4 === 0,
    hairBun: (h >>> 12) % 3 === 0,
  }
}

function findBone(root: Object3D, name: string): Bone | null {
  let found: Bone | null = null
  root.traverse((obj) => {
    if (found) return
    if ((obj as Bone).isBone && obj.name === name) found = obj as Bone
  })
  return found
}

/** 前台：耳机前台 GLB，半身构图 + 骨骼 idle/点头/挥手 */
function ReceptionGltfFigure({ presence }: { presence: ExpertPresence }) {
  const root = useRef<Group>(null)
  const { scene } = useGLTF(RECEPTION_GLB)
  const bones = useMemo(() => {
    return {
      head: findBone(scene, 'mixamorigHead'),
      leftArm: findBone(scene, 'mixamorigLeftArm'),
      rightArm: findBone(scene, 'mixamorigRightArm'),
      leftFore: findBone(scene, 'mixamorigLeftForeArm'),
      rightFore: findBone(scene, 'mixamorigRightForeArm'),
    }
  }, [scene])

  const fit = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const size = new Vector3()
    const center = new Vector3()
    box.getSize(size)
    box.getCenter(center)
    const scale = 1.7 / Math.max(size.y, 0.001)
    return {
      scale,
      position: [-center.x * scale, -center.y * scale - 0.28, -center.z * scale] as [
        number,
        number,
        number,
      ],
    }
  }, [scene])

  useEffect(() => {
    scene.traverse((obj) => {
      if (obj.name === 'receptionistprop') {
        obj.visible = false
      }
      if ('castShadow' in obj) {
        ;(obj as { castShadow: boolean }).castShadow = true
      }
    })
    if (bones.leftArm) bones.leftArm.rotation.set(1.25, 0, 0.12)
    if (bones.rightArm) bones.rightArm.rotation.set(1.25, 0, -0.12)
    if (bones.leftFore) bones.leftFore.rotation.set(0.15, 0, 0)
    if (bones.rightFore) bones.rightFore.rotation.set(0.15, 0, 0)
  }, [scene, bones])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (root.current) {
      root.current.rotation.y = Math.sin(t * 0.55) * 0.28
    }
    const { head, rightArm, leftArm, rightFore } = bones
    if (head) {
      if (presence === 'thinking') {
        head.rotation.z = Math.sin(t * 2.2) * 0.14
        head.rotation.x = -0.08
      } else if (presence === 'waiting') {
        head.rotation.x = Math.sin(t * 2.4) * 0.1
        head.rotation.z = 0
      } else {
        head.rotation.x = Math.sin(t * 1.05) * 0.045
        head.rotation.z = Math.sin(t * 0.7) * 0.03
      }
    }
    if (rightArm) {
      if (presence === 'waiting') {
        rightArm.rotation.set(0.55 + Math.sin(t * 3.1) * 0.22, 0, -0.35)
        if (rightFore) rightFore.rotation.set(0.4, 0, 0)
      } else {
        rightArm.rotation.set(1.25, 0, -0.12)
        if (rightFore) rightFore.rotation.set(0.15, 0, 0)
      }
    }
    if (leftArm) {
      leftArm.rotation.set(1.25, 0, 0.12)
    }
  })

  return (
    <group ref={root}>
      <group scale={fit.scale} position={fit.position}>
        <primitive object={scene} />
      </group>
    </group>
  )
}

function ProceduralBustFigure({
  kind,
  presence,
  accent,
  seed,
}: {
  kind: AvatarKind
  presence: ExpertPresence
  accent: string
  seed: string
}) {
  const root = useRef<Group>(null)
  const head = useRef<Group>(null)
  const waveArm = useRef<Group>(null)
  const leftArm = useRef<Group>(null)
  const rightArm = useRef<Group>(null)
  const t = useMemo(() => traitsFromSeed(seed, kind, accent), [seed, kind, accent])

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    if (!root.current) return
    root.current.position.y = Math.sin(time * 1.6) * 0.012
    root.current.rotation.y = Math.sin(time * 0.7) * 0.45
    if (head.current) {
      if (presence === 'thinking') {
        head.current.rotation.z = Math.sin(time * 2.2) * 0.1
        head.current.rotation.x = -0.1
      } else {
        head.current.rotation.x = Math.sin(time * 1.1) * 0.04
        head.current.rotation.z = Math.sin(time * 0.8) * 0.03
      }
    }
    if (leftArm.current) {
      if (presence === 'waiting') {
        leftArm.current.rotation.z = 0.7 + Math.sin(time * 3) * 0.1
        leftArm.current.rotation.x = 0.35
      } else {
        leftArm.current.rotation.z = 0.25
        leftArm.current.rotation.x = 0.1
      }
    }
    const rArm = waveArm.current ?? rightArm.current
    if (rArm) {
      if (presence === 'waiting') {
        rArm.rotation.z = -0.7 - Math.sin(time * 3) * 0.1
        rArm.rotation.x = 0.35
      } else {
        rArm.rotation.z = -0.25
        rArm.rotation.x = 0.1
      }
    }
  })

  return (
    <group ref={root}>
      <group ref={head} position={[0, 0.05, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.34, 32, 32]} />
          <meshStandardMaterial color={t.skin} roughness={0.42} metalness={0.02} />
        </mesh>
        <mesh position={[-0.31, 0, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={t.skin} roughness={0.5} />
        </mesh>
        <mesh position={[0.31, 0, 0]}>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={t.skin} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.14, -0.02]} scale={[1.05, 0.78, 1.08]}>
          <sphereGeometry args={[0.33, 24, 24]} />
          <meshStandardMaterial color={t.hair} roughness={0.85} />
        </mesh>
        {t.hairBun ? (
          <mesh position={[0, 0.38, -0.06]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshStandardMaterial color={t.hair} roughness={0.85} />
          </mesh>
        ) : null}
        <group position={[-0.11, 0.05, 0.29]}>
          <mesh>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color="#fffef8" />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <sphereGeometry args={[0.024, 10, 10]} />
            <meshStandardMaterial color="#1c1917" />
          </mesh>
        </group>
        <group position={[0.11, 0.05, 0.29]}>
          <mesh>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color="#fffef8" />
          </mesh>
          <mesh position={[0, 0, 0.035]}>
            <sphereGeometry args={[0.024, 10, 10]} />
            <meshStandardMaterial color="#1c1917" />
          </mesh>
        </group>
        <mesh position={[-0.11, 0.14, 0.3]} rotation={[0.15, 0, 0.1]}>
          <boxGeometry args={[0.1, 0.014, 0.02]} />
          <meshStandardMaterial color={t.hair} />
        </mesh>
        <mesh position={[0.11, 0.14, 0.3]} rotation={[0.15, 0, -0.1]}>
          <boxGeometry args={[0.1, 0.014, 0.02]} />
          <meshStandardMaterial color={t.hair} />
        </mesh>
        <mesh position={[0, -0.1, 0.3]} rotation={[0.35, 0, 0]}>
          <torusGeometry args={[0.06, 0.01, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#9a3412" />
        </mesh>
        {t.glasses ? (
          <group position={[0, 0.05, 0.31]}>
            <mesh position={[-0.11, 0, 0]}>
              <torusGeometry args={[0.065, 0.01, 8, 20]} />
              <meshStandardMaterial color="#334155" metalness={0.35} />
            </mesh>
            <mesh position={[0.11, 0, 0]}>
              <torusGeometry args={[0.065, 0.01, 8, 20]} />
              <meshStandardMaterial color="#334155" metalness={0.35} />
            </mesh>
          </group>
        ) : null}
      </group>
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.12, 12]} />
        <meshStandardMaterial color={t.skin} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.55, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.18, 6, 12]} />
        <meshStandardMaterial color={t.shirt} roughness={0.55} metalness={0.08} />
      </mesh>
      <group ref={leftArm} position={[-0.36, -0.38, 0]}>
        <mesh position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.06, 0.18, 4, 8]} />
          <meshStandardMaterial color={t.shirt} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={t.skin} roughness={0.5} />
        </mesh>
      </group>
      <group ref={rightArm} position={[0.36, -0.38, 0]}>
        <mesh position={[0, -0.16, 0]}>
          <capsuleGeometry args={[0.06, 0.18, 4, 8]} />
          <meshStandardMaterial color={t.shirt} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.3, 0]}>
          <sphereGeometry args={[0.065, 12, 12]} />
          <meshStandardMaterial color={t.skin} roughness={0.5} />
        </mesh>
      </group>
      <group ref={waveArm} visible={false} />
    </group>
  )
}

export function LiveBust3D({
  width,
  height,
  kind,
  presence,
  accent,
  seed,
  className,
}: {
  width: number
  height: number
  kind: AvatarKind
  presence: ExpertPresence
  accent: string
  seed: string
  className?: string
}) {
  const bg = kind === 'reception' ? '#d1fae5' : '#e8eef5'
  const isReception = kind === 'reception'
  return (
    <div
      className={className}
      style={{ width, height }}
      data-testid="live-bust-3d"
      data-live3d="1"
      data-live3d-source={isReception ? 'glb' : 'procedural'}
    >
      <Canvas
        dpr={[1, 1.75]}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        camera={{
          position: isReception ? [0, 0.72, 1.4] : [0, 0.02, 1.35],
          fov: isReception ? 28 : 40,
          near: 0.1,
          far: 40,
        }}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'inherit',
          touchAction: 'none',
        }}
      >
        <color attach="background" args={[bg]} />
        <ambientLight intensity={isReception ? 1.05 : 0.9} />
        <directionalLight
          position={[2.4, 2.8, 2.2]}
          intensity={isReception ? 1.5 : 1.35}
        />
        <directionalLight position={[-2, 1.4, -1]} intensity={0.4} />
        {isReception ? (
          <directionalLight
            position={[0.2, 1.2, 2]}
            intensity={0.55}
            color="#5eead4"
          />
        ) : null}
        <Suspense fallback={null}>
          {isReception ? (
            <ReceptionGltfFigure presence={presence} />
          ) : (
            <ProceduralBustFigure
              kind={kind}
              presence={presence}
              accent={accent}
              seed={seed}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}

useGLTF.preload(RECEPTION_GLB)
