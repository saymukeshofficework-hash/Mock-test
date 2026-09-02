import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Icon from '../Icon'
import { specimenSlides, SpecimenSlide } from '../../data/virtualLab'

export default function MicroscopeView() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [selectedSlide, setSelectedSlide] = useState<SpecimenSlide>(specimenSlides[0])
  const [objective, setObjective] = useState<'4x' | '10x' | '40x' | '100x'>('10x')
  const [coarseFocus, setCoarseFocus] = useState<number>(50)
  const [fineFocus, setFineFocus] = useState<number>(50)
  const [lightIntensity, setLightIntensity] = useState<number>(85)

  // Focus calculation: optimal focus is around coarse: 50, fine: 50
  const focusOffset = Math.abs(coarseFocus - 50) * 1.5 + Math.abs(fineFocus - 50) * 0.4
  const blurAmount = Math.min(14, focusOffset * 0.28)
  const isSharp = blurAmount < 1.2

  // Total magnification
  const magMultiplier = objective === '4x' ? 40 : objective === '10x' ? 100 : objective === '40x' ? 400 : 1000

  // 3D Three.js scene for the microscope apparatus
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 400
    const height = container.clientHeight || 420

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x071426) // navy-950

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(4, 4.5, 6.5)
    camera.lookAt(0, 1.2, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0x22d3ee, 2.5) // cyan accent
    dirLight.position.set(5, 8, 5)
    scene.add(dirLight)

    const fillLight = new THREE.PointLight(0x3b82f6, 1.8) // brand blue
    fillLight.position.set(-4, 3, 2)
    scene.add(fillLight)

    // Microscope Body Group
    const microscope = new THREE.Group()

    // 1. Heavy Horseshoe Base
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.9, 0.45, 32)
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x0f2a4a, roughness: 0.3, metalness: 0.7 })
    const baseMesh = new THREE.Mesh(baseGeo, metalMat)
    baseMesh.position.y = 0.22
    microscope.add(baseMesh)

    // 2. Curved Arm (Pillar)
    const armGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.2, 24)
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.2, metalness: 0.9 })
    const armMesh = new THREE.Mesh(armGeo, metalMat)
    armMesh.position.set(-0.8, 1.9, 0)
    armMesh.rotation.z = -0.18
    microscope.add(armMesh)

    // 3. Stage (moves vertically with coarse focus)
    const stageGeo = new THREE.BoxGeometry(2.2, 0.18, 2.0)
    const stageMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6, metalness: 0.4 })
    const stageMesh = new THREE.Mesh(stageGeo, stageMat)
    stageMesh.position.set(0.1, 1.5, 0)
    microscope.add(stageMesh)

    // Glass slide on stage
    const slideGeo = new THREE.BoxGeometry(1.2, 0.05, 0.5)
    const slideMat = new THREE.MeshPhysicalMaterial({ color: 0xa5f3fc, transparent: true, opacity: 0.75, transmission: 0.9 })
    const slideMesh = new THREE.Mesh(slideGeo, slideMat)
    slideMesh.position.set(0.1, 1.62, 0)
    microscope.add(slideMesh)

    // Coverslip
    const coverGeo = new THREE.BoxGeometry(0.4, 0.06, 0.4)
    const coverMat = new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.85 })
    const coverMesh = new THREE.Mesh(coverGeo, coverMat)
    coverMesh.position.set(0.1, 1.63, 0)
    microscope.add(coverMesh)

    // 4. Optical Body Tube
    const bodyTubeGeo = new THREE.CylinderGeometry(0.32, 0.32, 2.2, 24)
    const bodyTube = new THREE.Mesh(bodyTubeGeo, chromeMat)
    bodyTube.position.set(0.1, 3.2, 0)
    microscope.add(bodyTube)

    // 5. Eyepiece
    const eyepieceGeo = new THREE.CylinderGeometry(0.38, 0.3, 0.7, 24)
    const eyepiece = new THREE.Mesh(eyepieceGeo, metalMat)
    eyepiece.position.set(0.1, 4.35, 0)
    microscope.add(eyepiece)

    // 6. Revolving Nosepiece with Objective Lenses
    const nosepieceGroup = new THREE.Group()
    nosepieceGroup.position.set(0.1, 2.08, 0)

    const noseGeo = new THREE.CylinderGeometry(0.55, 0.4, 0.3, 24)
    const noseMesh = new THREE.Mesh(noseGeo, metalMat)
    nosepieceGroup.add(noseMesh)

    // 4 Objective lenses arranged at 90° intervals
    const lensColors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6]
    const lensHeights = [0.45, 0.65, 0.85, 1.05]
    for (let i = 0; i < 4; i++) {
      const angle = (i * Math.PI) / 2
      const objTubeGeo = new THREE.CylinderGeometry(0.14, 0.1, lensHeights[i], 16)
      const objMat = new THREE.MeshStandardMaterial({ color: lensColors[i], metalness: 0.8, roughness: 0.2 })
      const objMesh = new THREE.Mesh(objTubeGeo, objMat)
      objMesh.position.set(Math.cos(angle) * 0.32, -lensHeights[i] / 2, Math.sin(angle) * 0.32)
      nosepieceGroup.add(objMesh)
    }
    microscope.add(nosepieceGroup)

    // 7. Substage Light Condenser / Illuminator
    const lightGeo = new THREE.CylinderGeometry(0.4, 0.5, 0.4, 24)
    const lightEmitterMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    const lightSource = new THREE.Mesh(lightGeo, lightEmitterMat)
    lightSource.position.set(0.1, 0.7, 0)
    microscope.add(lightSource)

    // 8. Focus Adjustment Knobs on the Arm
    const knobGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.3, 24)
    const coarseKnob = new THREE.Mesh(knobGeo, metalMat)
    coarseKnob.rotation.x = Math.PI / 2
    coarseKnob.position.set(-0.8, 1.8, 0.6)
    microscope.add(coarseKnob)

    const fineKnobGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.45, 24)
    const fineKnob = new THREE.Mesh(fineKnobGeo, chromeMat)
    fineKnob.rotation.x = Math.PI / 2
    fineKnob.position.set(-0.8, 1.8, 0.75)
    microscope.add(fineKnob)

    scene.add(microscope)

    // Interactive mouse rotation
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
      microscope.rotation.y += deltaX * 0.008
      microscope.rotation.x = Math.max(-0.4, Math.min(0.4, microscope.rotation.x + deltaY * 0.006))
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

    // Animation Loop
    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)

      // Idle gentle float when not dragging
      if (!isDragging) {
        microscope.rotation.y += 0.002
      }

      // Sync stage height with coarse focus slider
      stageMesh.position.y = 1.35 + (coarseFocus / 100) * 0.35
      slideMesh.position.y = stageMesh.position.y + 0.11
      coverMesh.position.y = slideMesh.position.y + 0.02

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
  }, [coarseFocus])

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Left Column: 3D Microscope Interactive Rig */}
      <div className="card flex-1 p-5 lg:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-navy-800">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
              3D Mechanical Stage & Optics
            </h3>
          </div>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-navy-800 dark:text-slate-400">
            Drag to Rotate 360°
          </span>
        </div>

        {/* 3D WebGL Canvas Container */}
        <div
          ref={mountRef}
          className="relative mt-4 h-80 w-full cursor-grab rounded-xl border border-slate-200 bg-navy-950 shadow-inner active:cursor-grabbing sm:h-96"
        >
          {/* Overlay Status */}
          <div className="absolute left-3 top-3 rounded-lg bg-navy-900/80 px-2.5 py-1 text-xs text-cyan-300 backdrop-blur border border-cyan-500/20 pointer-events-none">
            Slide Mounted: <strong className="text-white">{selectedSlide.commonName}</strong>
          </div>
          <div className="absolute right-3 top-3 rounded-lg bg-navy-900/80 px-2.5 py-1 text-xs text-emerald-400 backdrop-blur border border-emerald-500/20 pointer-events-none">
            Active: <strong className="text-white">{objective} ({magMultiplier}x)</strong>
          </div>
          <div className="absolute bottom-3 left-3 text-[11px] text-slate-400 pointer-events-none">
            Adjust focus knobs below to sharpen ocular view
          </div>
        </div>

        {/* Microscope Physical Controls */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {/* Coarse Focus Knob */}
          <div className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-navy-900 dark:text-white">Coarse Adjustment</span>
              <span className="text-brand-600 dark:text-cyan-400">{coarseFocus}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={coarseFocus}
              onChange={(e) => setCoarseFocus(Number(e.target.value))}
              className="mt-2 w-full accent-brand-600 dark:accent-cyan-400"
              aria-label="Coarse focus slider"
            />
            <p className="mt-1 text-[11px] text-slate-400">Raises / lowers the stage elevation rapidly</p>
          </div>

          {/* Fine Focus Knob */}
          <div className="rounded-xl border border-slate-200 p-3 dark:border-navy-700">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-navy-900 dark:text-white">Fine Adjustment</span>
              <span className="text-brand-600 dark:text-cyan-400">{fineFocus}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={fineFocus}
              onChange={(e) => setFineFocus(Number(e.target.value))}
              className="mt-2 w-full accent-brand-600 dark:accent-cyan-400"
              aria-label="Fine focus slider"
            />
            <p className="mt-1 text-[11px] text-slate-400">Micro-adjusts focal sharpness on delicate organelles</p>
          </div>
        </div>

        {/* Objective Lens Turret Selector */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 dark:border-navy-800">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
            Nosepiece Objective:
          </span>
          {[
            { power: '4x' as const, label: '4x (Scanning)', color: 'border-red-500' },
            { power: '10x' as const, label: '10x (Low Power)', color: 'border-amber-500' },
            { power: '40x' as const, label: '40x (High Power)', color: 'border-emerald-500' },
            { power: '100x' as const, label: '100x (Oil Immersion)', color: 'border-blue-500' },
          ].map((obj) => (
            <button
              key={obj.power}
              type="button"
              onClick={() => setObjective(obj.power)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all border ${
                objective === obj.power
                  ? 'bg-navy-900 text-cyan-300 border-cyan-400 shadow-sm dark:bg-cyan-400 dark:text-navy-950'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-navy-800 dark:border-navy-700 dark:text-slate-300'
              }`}
            >
              {obj.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right Column: Simulated Ocular Eyepiece Field of View */}
      <div className="card flex flex-col justify-between p-5 lg:w-[420px] lg:p-6">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-navy-800">
            <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
              Ocular Eyepiece View (10x)
            </h3>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                isSharp
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {isSharp ? 'In Sharp Focus' : 'Out of Focus'}
            </span>
          </div>

          {/* Circular Microscopic Viewport */}
          <div className="relative mt-4 flex items-center justify-center">
            {/* Dark microscope chassis mask */}
            <div className="relative h-64 w-64 overflow-hidden rounded-full border-8 border-navy-950 bg-black shadow-2xl ring-4 ring-slate-300 dark:ring-navy-700 sm:h-72 sm:w-72">
              {/* Illumination gradient overlay */}
              <div
                className="absolute inset-0 z-10 pointer-events-none rounded-full transition-opacity duration-300"
                style={{
                  background:
                    'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.85) 90%, rgba(0,0,0,0.98) 100%)',
                  opacity: lightIntensity / 100,
                }}
              />

              {/* Specimen Visual Simulation */}
              <div
                className="h-full w-full transition-all duration-300"
                style={{
                  filter: `blur(${blurAmount}px) brightness(${lightIntensity / 90})`,
                  transform: `scale(${objective === '4x' ? 0.75 : objective === '10x' ? 1 : objective === '40x' ? 1.6 : 2.4})`,
                }}
              >
                {/* Specific Specimen Slide Renderers */}
                {selectedSlide.id === 'onion-peel' && (
                  <div className="grid h-full w-full grid-cols-4 grid-rows-4 gap-1 p-3 bg-amber-100/40">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className="relative rounded-sm border-2 border-amber-800/80 bg-amber-200/30 p-1 flex items-center justify-center"
                      >
                        {/* Nucleus */}
                        <div className="absolute right-1 top-1 h-3 w-3 rounded-full bg-amber-900 shadow-sm" />
                        {/* Vacuole boundary */}
                        <div className="h-4/5 w-4/5 rounded border border-amber-600/40 bg-white/20" />
                      </div>
                    ))}
                  </div>
                )}

                {selectedSlide.id === 'human-cheek' && (
                  <div className="relative h-full w-full bg-blue-100/30 p-4">
                    {/* Irregular epithelial cells */}
                    <div className="absolute left-6 top-8 h-20 w-24 rounded-[40%_60%_70%_30%/40%_50%_60%_50%] border-2 border-blue-600/70 bg-blue-200/40">
                      <div className="absolute left-8 top-8 h-4 w-4 rounded-full bg-blue-900" />
                    </div>
                    <div className="absolute right-8 top-16 h-24 w-28 rounded-[50%_50%_30%_70%/60%_40%_60%_40%] border-2 border-blue-600/70 bg-blue-200/40">
                      <div className="absolute left-10 top-10 h-4 w-4 rounded-full bg-blue-900" />
                    </div>
                    <div className="absolute bottom-6 left-14 h-22 w-26 rounded-[60%_40%_50%_50%/40%_60%_40%_60%] border-2 border-blue-600/70 bg-blue-200/40">
                      <div className="absolute left-9 top-8 h-4 w-4 rounded-full bg-blue-900" />
                    </div>
                  </div>
                )}

                {selectedSlide.id === 'stomata-peel' && (
                  <div className="relative h-full w-full bg-emerald-50/40 p-4">
                    {/* Epidermal Cells with wavy walls */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 opacity-30">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border border-emerald-700 rounded-lg" />
                      ))}
                    </div>
                    {/* Central Stomatal Apparatus */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="relative flex items-center gap-1">
                        {/* Left Guard Cell */}
                        <div className="h-20 w-8 rounded-[50%_15%_15%_50%] border-2 border-emerald-900 bg-emerald-400/80 relative shadow-md">
                          <div className="absolute left-1.5 top-4 h-2 w-2 rounded-full bg-emerald-800" />
                          <div className="absolute left-1.5 top-9 h-2.5 w-2.5 rounded-full bg-emerald-950" />
                          <div className="absolute left-1.5 bottom-4 h-2 w-2 rounded-full bg-emerald-800" />
                        </div>
                        {/* Stomatal Pore */}
                        <div className="h-10 w-2.5 rounded-full bg-emerald-950/80" />
                        {/* Right Guard Cell */}
                        <div className="h-20 w-8 rounded-[15%_50%_50%_15%] border-2 border-emerald-900 bg-emerald-400/80 relative shadow-md">
                          <div className="absolute right-1.5 top-4 h-2 w-2 rounded-full bg-emerald-800" />
                          <div className="absolute right-1.5 top-9 h-2.5 w-2.5 rounded-full bg-emerald-950" />
                          <div className="absolute right-1.5 bottom-4 h-2 w-2 rounded-full bg-emerald-800" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSlide.id === 'blood-smear' && (
                  <div className="relative h-full w-full bg-rose-50/50 p-2">
                    {/* Multitude of RBCs */}
                    {Array.from({ length: 28 }).map((_, i) => {
                      const top = (i * 17) % 85 + 5
                      const left = (i * 23) % 85 + 5
                      return (
                        <div
                          key={i}
                          className="absolute h-5 w-5 rounded-full border border-red-500/80 bg-red-400/70 shadow-inner flex items-center justify-center"
                          style={{ top: `${top}%`, left: `${left}%` }}
                        >
                          <div className="h-2 w-2 rounded-full bg-rose-100/60" />
                        </div>
                      )
                    })}
                    {/* WBC with Multi-lobed Nucleus */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 border-purple-800 bg-purple-200/80 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-full bg-purple-900 shadow-sm" />
                    </div>
                  </div>
                )}

                {selectedSlide.id === 'spirogyra' && (
                  <div className="relative h-full w-full bg-teal-50/40 p-4 flex flex-col justify-center gap-3">
                    {/* Filament 1 */}
                    <div className="relative h-12 w-full rounded border-2 border-emerald-800 bg-emerald-100/60 overflow-hidden flex items-center">
                      {/* Spiral Chloroplast Ribbon */}
                      <div className="absolute inset-0 flex items-center justify-around">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-10 w-4 rounded-full bg-emerald-600 rotate-45 relative flex items-center justify-center"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Filament 2 */}
                    <div className="relative h-12 w-full rounded border-2 border-emerald-800 bg-emerald-100/60 overflow-hidden flex items-center">
                      <div className="absolute inset-0 flex items-center justify-around">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className="h-10 w-4 rounded-full bg-emerald-600 -rotate-45 relative flex items-center justify-center"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Lens Eyepiece Stats Bar */}
          <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-navy-800/80">
            <div>
              <span className="text-slate-400">Total Power:</span>{' '}
              <strong className="text-navy-900 dark:text-white">{magMultiplier}x</strong>
            </div>
            <div>
              <span className="text-slate-400">Stain:</span>{' '}
              <span className="font-semibold text-brand-600 dark:text-cyan-400 truncate max-w-[150px] inline-block align-bottom">
                {selectedSlide.stain}
              </span>
            </div>
          </div>

          {/* Substage Illuminator Brightness Slider */}
          <div className="mt-3 flex items-center gap-3 text-xs font-semibold text-slate-500">
            <Icon name="sun" className="h-4 w-4" />
            <span className="shrink-0">Light:</span>
            <input
              type="range"
              min="20"
              max="100"
              value={lightIntensity}
              onChange={(e) => setLightIntensity(Number(e.target.value))}
              className="w-full accent-cyan-400"
              aria-label="Light intensity"
            />
            <span className="w-8 text-right">{lightIntensity}%</span>
          </div>

          {/* Magnification Specific Note */}
          <p className="mt-3 text-xs italic text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-navy-800 pt-2.5">
            "{selectedSlide.magnificationNotes[objective]}"
          </p>
        </div>

        {/* Specimen Slide Box Selector */}
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-navy-800">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Select Specimen Slide from Box:
          </p>
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
            {specimenSlides.map((slide) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setSelectedSlide(slide)}
                className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-all ${
                  selectedSlide.id === slide.id
                    ? 'bg-brand-600 text-white shadow-sm dark:bg-cyan-400 dark:text-navy-950 font-bold'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-navy-800/60 dark:text-slate-300 dark:hover:bg-navy-800'
                }`}
              >
                <span>{slide.commonName}</span>
                <span className="text-[10px] opacity-80 uppercase tracking-wider">{slide.cellType}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
