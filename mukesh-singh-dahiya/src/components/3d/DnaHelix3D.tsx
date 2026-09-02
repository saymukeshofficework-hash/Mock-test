import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Icon from '../Icon'

export default function DnaHelix3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [rotationSpeed, setRotationSpeed] = useState<number>(50)
  const [unzipProgress, setUnzipProgress] = useState<number>(0)
  const [highlightBase, setHighlightBase] = useState<'all' | 'AT' | 'GC'>('all')

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 500
    const height = container.clientHeight || 450

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x071426)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 9)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    const dirLight1 = new THREE.DirectionalLight(0x22d3ee, 2.0)
    dirLight1.position.set(5, 10, 5)
    scene.add(dirLight1)

    const dirLight2 = new THREE.PointLight(0xd946ef, 1.6)
    dirLight2.position.set(-5, -5, 5)
    scene.add(dirLight2)

    // DNA Assembly
    const dnaGroup = new THREE.Group()

    const numBasePairs = 24
    const radius = 1.4
    const heightStep = 0.32
    const angleStep = Math.PI / 6 // 30 degrees per step = 12 pairs per turn

    // Store references to rungs to animate unzipping
    const rungs: { leftArm: THREE.Mesh; rightArm: THREE.Mesh; basePair: string; initialY: number }[] = []

    for (let i = 0; i < numBasePairs; i++) {
      const y = (i - numBasePairs / 2) * heightStep
      const angle = i * angleStep

      // Coordinates on the two strands
      const x1 = Math.cos(angle) * radius
      const z1 = Math.sin(angle) * radius

      const x2 = Math.cos(angle + Math.PI) * radius
      const z2 = Math.sin(angle + Math.PI) * radius

      // Sugar-phosphate backbone spheres (blue/cyan)
      const beadGeo = new THREE.SphereGeometry(0.16, 16, 16)
      const beadMat1 = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.6, roughness: 0.3 })
      const beadMat2 = new THREE.MeshStandardMaterial({ color: 0x818cf8, metalness: 0.6, roughness: 0.3 })

      const bead1 = new THREE.Mesh(beadGeo, beadMat1)
      bead1.position.set(x1, y, z1)
      dnaGroup.add(bead1)

      const bead2 = new THREE.Mesh(beadGeo, beadMat2)
      bead2.position.set(x2, y, z2)
      dnaGroup.add(bead2)

      // Base pair assignment: alternating A-T and G-C
      const isAT = i % 2 === 0
      const pairType = isAT ? 'AT' : 'GC'

      // Base Colors:
      // Adenine: Emerald (0x10b981), Thymine: Rose (0xf43f5e)
      // Guanine: Cyan (0x06b6d4), Cytosine: Amber (0xf59e0b)
      const leftColor = isAT ? 0x10b981 : 0x06b6d4
      const rightColor = isAT ? 0xf43f5e : 0xf59e0b

      // Left half rung
      const halfDist = radius * 0.45
      const rungGeo = new THREE.CylinderGeometry(0.08, 0.08, halfDist, 12)

      const isDimmed = (highlightBase === 'AT' && !isAT) || (highlightBase === 'GC' && isAT)
      const leftMat = new THREE.MeshStandardMaterial({
        color: leftColor,
        roughness: 0.3,
        transparent: isDimmed,
        opacity: isDimmed ? 0.15 : 1.0,
      })
      const leftMesh = new THREE.Mesh(rungGeo, leftMat)
      leftMesh.position.set(x1 * 0.5, y, z1 * 0.5)
      leftMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x2 - x1, 0, z2 - z1).normalize()
      )
      dnaGroup.add(leftMesh)

      // Right half rung
      const rightMat = new THREE.MeshStandardMaterial({
        color: rightColor,
        roughness: 0.3,
        transparent: isDimmed,
        opacity: isDimmed ? 0.15 : 1.0,
      })
      const rightMesh = new THREE.Mesh(rungGeo, rightMat)
      rightMesh.position.set(x2 * 0.5, y, z2 * 0.5)
      rightMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(x2 - x1, 0, z2 - z1).normalize()
      )
      dnaGroup.add(rightMesh)

      rungs.push({ leftArm: leftMesh, rightArm: rightMesh, basePair: pairType, initialY: y })
    }

    scene.add(dnaGroup)

    // Interactive Drag Controls
    let isDragging = false
    let prevMouseX = 0
    let prevMouseY = 0

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      const deltaX = e.clientX - prevMouseX
      const deltaY = e.clientY - prevMouseY
      dnaGroup.rotation.y += deltaX * 0.008
      dnaGroup.rotation.x += deltaY * 0.006
      prevMouseX = e.clientX
      prevMouseY = e.clientY
    }

    const onMouseUp = () => {
      isDragging = false
    }

    const domEl = renderer.domElement
    domEl.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)

      if (!isDragging) {
        dnaGroup.rotation.y += (rotationSpeed / 100) * 0.02
      }

      // Animate unzipping separation when slider is moved
      const separation = (unzipProgress / 100) * 1.8
      rungs.forEach((r, idx) => {
        // Upper base pairs separate more (replication fork)
        const factor = Math.max(0, (idx - (numBasePairs - (unzipProgress / 100) * numBasePairs)) * 0.2)
        r.leftArm.position.x = r.leftArm.position.x - factor * separation * 0.02
        r.rightArm.position.x = r.rightArm.position.x + factor * separation * 0.02
      })

      renderer.render(scene, camera)
    }
    animate()

    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
      domEl.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [rotationSpeed, unzipProgress, highlightBase])

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="card flex-1 p-5 lg:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-navy-800">
          <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
            B-DNA Double Helix Model (Watson & Crick 1953)
          </h3>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-navy-800 dark:text-slate-400">
            Drag to Rotate in 3D
          </span>
        </div>

        <div
          ref={mountRef}
          className="relative mt-4 h-80 w-full cursor-grab rounded-xl border border-slate-200 bg-navy-950 shadow-inner active:cursor-grabbing sm:h-96"
        >
          {/* Base Pair Legend Overlay */}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5 rounded-lg bg-navy-900/85 p-2.5 text-xs backdrop-blur border border-white/10 pointer-events-none">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Base Pairing:</span>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="text-white font-medium">Adenine (A) = </span>
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span className="text-white font-medium">Thymine (T)</span>
              <span className="text-[10px] text-cyan-300">(2 H-Bonds)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
              <span className="text-white font-medium">Guanine (G) ≡ </span>
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="text-white font-medium">Cytosine (C)</span>
              <span className="text-[10px] text-cyan-300">(3 H-Bonds)</span>
            </div>
          </div>
        </div>

        {/* Sliders & Controls */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-navy-900 dark:text-white">Helical Rotation Speed</span>
              <span className="text-brand-600 dark:text-cyan-400">{rotationSpeed}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(Number(e.target.value))}
              className="mt-2 w-full accent-brand-600 dark:accent-cyan-400"
              aria-label="Rotation speed slider"
            />
          </div>

          <div className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-navy-900 dark:text-white">Replication Fork Unzipping</span>
              <span className="text-brand-600 dark:text-cyan-400">{unzipProgress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={unzipProgress}
              onChange={(e) => setUnzipProgress(Number(e.target.value))}
              className="mt-2 w-full accent-brand-600 dark:accent-cyan-400"
              aria-label="Unzipping slider"
            />
          </div>
        </div>

        {/* Base Pair Filter Buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-navy-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Isolate Base Pairs:
          </span>
          {[
            { id: 'all' as const, label: 'All Base Pairs' },
            { id: 'AT' as const, label: 'A = T Only (2 H-Bonds)' },
            { id: 'GC' as const, label: 'G ≡ C Only (3 H-Bonds)' },
          ].map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => setHighlightBase(btn.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                highlightBase === btn.id
                  ? 'bg-navy-900 text-cyan-300 border-cyan-400 shadow-sm dark:bg-cyan-400 dark:text-navy-950'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-navy-800 dark:border-navy-700 dark:text-slate-300'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Molecular Geometry & NEET Points */}
      <div className="card flex flex-col justify-between p-5 lg:w-[420px] lg:p-6">
        <div>
          <div className="border-b border-slate-100 pb-3 dark:border-navy-800">
            <span className="section-label">Molecular Dimensions</span>
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white mt-1">
              B-DNA Structural Parameters
            </h3>
          </div>

          <div className="mt-4 space-y-3 text-xs">
            <div className="flex justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-navy-800">
              <span className="text-slate-500">Helical Pitch (One Turn):</span>
              <strong className="text-navy-900 dark:text-white">3.4 nm (34 Å)</strong>
            </div>
            <div className="flex justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-navy-800">
              <span className="text-slate-500">Base Pairs per Turn:</span>
              <strong className="text-navy-900 dark:text-white">10 base pairs</strong>
            </div>
            <div className="flex justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-navy-800">
              <span className="text-slate-500">Distance Between Base Pairs:</span>
              <strong className="text-navy-900 dark:text-white">0.34 nm (3.4 Å)</strong>
            </div>
            <div className="flex justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-navy-800">
              <span className="text-slate-500">Double Helix Diameter:</span>
              <strong className="text-navy-900 dark:text-white">2.0 nm (20 Å)</strong>
            </div>
            <div className="flex justify-between rounded-lg bg-slate-50 p-2.5 dark:bg-navy-800">
              <span className="text-slate-500">Strand Directionality:</span>
              <strong className="text-navy-900 dark:text-white">Antiparallel (5′→3′ & 3′→5′)</strong>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-500/30 dark:bg-amber-950/20">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
              <Icon name="sparkles" className="h-4 w-4" />
              <span>Chargaff's Equivalence Rule</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
              In double-stranded DNA: [A] = [T] and [G] = [C]. The total amount of purines equals pyrimidines: [A + G] = [T + C]. However, the base ratio (A+T)/(G+C) is species-specific!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
