import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Icon from '../Icon'

export default function StomataModel3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [lightIntensity, setLightIntensity] = useState<number>(80)
  const [waterStatus, setWaterStatus] = useState<number>(75)

  // Stomatal aperture calculation based on light & water
  // Requires both light (phototropins) and water (turgidity) to open
  const openFactor = Math.min(1, ((lightIntensity / 100) * (waterStatus / 100)) * 1.25)
  const apertureWidthMicrons = (openFactor * 8.5).toFixed(1)
  const transpirationRate = (openFactor * 42.5).toFixed(1)
  const bubbleCount = Math.round(openFactor * 32)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 500
    const height = container.clientHeight || 450

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x071426)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 0, 7.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfef08a, 2.0)
    sunLight.position.set(4, 6, 4)
    scene.add(sunLight)

    const apparatusGroup = new THREE.Group()

    // 1. Epidermal pavement cells background
    const bgPlaneGeo = new THREE.PlaneGeometry(10, 8, 4, 4)
    const bgPlaneMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      transparent: true,
      opacity: 0.35,
      roughness: 0.8,
    })
    const bgPlane = new THREE.Mesh(bgPlaneGeo, bgPlaneMat)
    bgPlane.position.z = -0.5
    apparatusGroup.add(bgPlane)

    // 2. Left Guard Cell
    const leftGuardGeo = new THREE.TorusGeometry(1.6, 0.55, 24, 48, Math.PI * 0.95)
    const guardMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.35,
      metalness: 0.1,
    })
    const leftGuard = new THREE.Mesh(leftGuardGeo, guardMat)
    leftGuard.rotation.z = Math.PI * 0.525
    leftGuard.position.set(-0.35, 0, 0)
    apparatusGroup.add(leftGuard)

    // 3. Right Guard Cell
    const rightGuardGeo = new THREE.TorusGeometry(1.6, 0.55, 24, 48, Math.PI * 0.95)
    const rightGuard = new THREE.Mesh(rightGuardGeo, guardMat)
    rightGuard.rotation.z = -Math.PI * 0.475
    rightGuard.position.set(0.35, 0, 0)
    apparatusGroup.add(rightGuard)

    // 4. Chloroplasts inside Guard Cells
    const chloroGeo = new THREE.SphereGeometry(0.14, 12, 12)
    const chloroMat = new THREE.MeshStandardMaterial({ color: 0x047857, roughness: 0.2 })

    const leftChloros: THREE.Mesh[] = []
    const rightChloros: THREE.Mesh[] = []

    for (let i = 0; i < 6; i++) {
      const angle = 0.3 + i * 0.4
      const cl = new THREE.Mesh(chloroGeo, chloroMat)
      cl.position.set(-1.3 + Math.cos(angle) * 0.3, -1.2 + i * 0.48, 0.2)
      leftGuard.add(cl)
      leftChloros.push(cl)

      const cr = new THREE.Mesh(chloroGeo, chloroMat)
      cr.position.set(1.3 - Math.cos(angle) * 0.3, -1.2 + i * 0.48, 0.2)
      rightGuard.add(cr)
      rightChloros.push(cr)
    }

    // 5. Stomatal Pore aperture representation (Dark void)
    const poreGeo = new THREE.CylinderGeometry(0.05, 0.05, 2.0, 16)
    const poreMat = new THREE.MeshBasicMaterial({ color: 0x022c22 })
    const poreMesh = new THREE.Mesh(poreGeo, poreMat)
    apparatusGroup.add(poreMesh)

    scene.add(apparatusGroup)

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
      apparatusGroup.rotation.y += deltaX * 0.008
      apparatusGroup.rotation.x += deltaY * 0.006
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

      // Guard cells bow outward when openFactor is high (turgid state)
      const spread = 0.2 + openFactor * 0.65
      leftGuard.position.x = -spread
      rightGuard.position.x = spread

      // Pore scale expansion
      poreMesh.scale.set(1 + openFactor * 8, 1, 1 + openFactor * 4)

      // Color shifts slightly to vivid emerald when turgid
      guardMat.color.setHSL(0.38, 0.75, 0.35 + openFactor * 0.15)

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
  }, [openFactor])

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="card flex-1 p-5 lg:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-navy-800">
          <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
            3D Guard Cells & Stomatal Pore Mechanism
          </h3>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
              openFactor > 0.4
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 dark:bg-navy-800 dark:text-slate-400'
            }`}
          >
            {openFactor > 0.4 ? 'Stoma: Turgid (OPEN)' : 'Stoma: Flaccid (CLOSED)'}
          </span>
        </div>

        <div
          ref={mountRef}
          className="relative mt-4 h-80 w-full cursor-grab rounded-xl border border-slate-200 bg-navy-950 shadow-inner active:cursor-grabbing sm:h-96"
        >
          {/* Pore Width Gauge Overlay */}
          <div className="absolute left-3 top-3 rounded-lg bg-navy-900/85 px-3 py-2 text-xs backdrop-blur border border-white/10 pointer-events-none">
            <span className="text-slate-400">Pore Aperture: </span>
            <strong className="text-cyan-300 text-sm">{apertureWidthMicrons} μm</strong>
          </div>

          <div className="absolute right-3 top-3 rounded-lg bg-navy-900/85 px-3 py-2 text-xs backdrop-blur border border-white/10 pointer-events-none">
            <span className="text-slate-400">Transpiration: </span>
            <strong className="text-emerald-400 text-sm">{transpirationRate} mg/dm²/h</strong>
          </div>
        </div>

        {/* Environmental Sliders */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-navy-900 dark:text-white">Sunlight Intensity</span>
              <span className="text-amber-500 font-bold">{lightIntensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={lightIntensity}
              onChange={(e) => setLightIntensity(Number(e.target.value))}
              className="mt-2 w-full accent-amber-500"
              aria-label="Sunlight intensity"
            />
            <p className="mt-1 text-[11px] text-slate-400">Triggers K⁺ active influx into guard cells</p>
          </div>

          <div className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-navy-900 dark:text-white">Leaf Water Status / Moisture</span>
              <span className="text-cyan-500 font-bold">{waterStatus}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={waterStatus}
              onChange={(e) => setWaterStatus(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
              aria-label="Water status"
            />
            <p className="mt-1 text-[11px] text-slate-400">Provides hydrostatic turgor pressure</p>
          </div>
        </div>
      </div>

      {/* Right Column: Live Physiological Stats */}
      <div className="card flex flex-col justify-between p-5 lg:w-[420px] lg:p-6">
        <div>
          <div className="border-b border-slate-100 pb-3 dark:border-navy-800">
            <span className="section-label">Physiological Response</span>
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white mt-1">
              Gas Exchange & Photosynthesis
            </h3>
          </div>

          {/* Real-time Counters */}
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-500/30 dark:bg-emerald-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                  O₂ Bubble Rate
                </span>
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white">
                  {bubbleCount} bubbles/min
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                Oxygen evolved by photolysis of water in thylakoid membranes during the light reaction.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-navy-700 dark:bg-navy-900">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                Cellulose Microfibrils Role
              </span>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                Cellulose microfibrils are oriented <strong>radially</strong> rather than longitudinally, which forces guard cells to lengthen and buckle outward when turgid, opening the pore!
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-500/30 dark:bg-amber-950/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Icon name="sparkles" className="h-4 w-4" />
                <span>Mukesh Sir's Key Point: Levitt Theory</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                Proton pump actively pumps H⁺ out of guard cells into subsidiary cells. K⁺ and Cl⁻ rush inward, lowering osmotic potential (Ψs) and driving endosmosis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
