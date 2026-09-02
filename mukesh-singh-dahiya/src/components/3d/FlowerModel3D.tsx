import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Icon from '../Icon'

export default function FlowerModel3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [dissectionStep, setDissectionStep] = useState<number>(0) // 0 to 4

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 500
    const height = container.clientHeight || 450

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x071426)

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 3.2, 6.8)
    camera.lookAt(0, 0.8, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
    scene.add(ambientLight)

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0)
    mainLight.position.set(5, 8, 5)
    scene.add(mainLight)

    const fillLight = new THREE.PointLight(0xf472b6, 1.6) // pink floral tint
    fillLight.position.set(-4, 2, 3)
    scene.add(fillLight)

    const flowerGroup = new THREE.Group()

    // 1. Pedicel & Thalamus (Receptacle)
    const pedicelGeo = new THREE.CylinderGeometry(0.12, 0.15, 2.2, 16)
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4 })
    const pedicel = new THREE.Mesh(pedicelGeo, stemMat)
    pedicel.position.y = -1.1
    flowerGroup.add(pedicel)

    const thalamusGeo = new THREE.CylinderGeometry(0.65, 0.25, 0.5, 24)
    const thalamus = new THREE.Mesh(thalamusGeo, stemMat)
    thalamus.position.y = 0.1
    flowerGroup.add(thalamus)

    // 2. Calyx (Sepals) - Visible in Step 0
    const sepalsGroup = new THREE.Group()
    const sepalGeo = new THREE.ConeGeometry(0.4, 0.9, 8)
    const sepalMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 })
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5
      const sepal = new THREE.Mesh(sepalGeo, sepalMat)
      sepal.position.set(Math.cos(angle) * 0.7, 0.3, Math.sin(angle) * 0.7)
      sepal.rotation.z = Math.cos(angle) * 0.4
      sepal.rotation.x = -Math.sin(angle) * 0.4
      sepalsGroup.add(sepal)
    }
    sepalsGroup.visible = dissectionStep < 1
    flowerGroup.add(sepalsGroup)

    // 3. Corolla (Petals) - Visible in Steps 0 and 1
    const petalsGroup = new THREE.Group()
    const petalGeo = new THREE.SphereGeometry(0.85, 24, 16)
    petalGeo.scale(1, 1.8, 0.15)
    const petalMat = new THREE.MeshStandardMaterial({
      color: 0xec4899,
      roughness: 0.35,
      metalness: 0.1,
      side: THREE.DoubleSide,
    })
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5 + 0.3
      const petal = new THREE.Mesh(petalGeo, petalMat)
      petal.position.set(Math.cos(angle) * 1.0, 1.1, Math.sin(angle) * 1.0)
      petal.rotation.y = -angle
      petal.rotation.x = 0.5
      petalsGroup.add(petal)
    }
    petalsGroup.visible = dissectionStep < 2
    flowerGroup.add(petalsGroup)

    // 4. Androecium (Stamens with Anther & Filament) - Visible in Steps 0, 1, 2
    const stamensGroup = new THREE.Group()
    const filGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 8)
    const filMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.2 })
    const antherGeo = new THREE.CapsuleGeometry(0.12, 0.22, 8, 12)
    const antherMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.3 })

    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI * 2) / 8
      const stamen = new THREE.Group()
      stamen.position.set(Math.cos(angle) * 0.45, 0.4, Math.sin(angle) * 0.45)

      const fil = new THREE.Mesh(filGeo, filMat)
      fil.position.y = 0.7
      fil.rotation.z = Math.cos(angle) * 0.15
      stamen.add(fil)

      const anther = new THREE.Mesh(antherGeo, antherMat)
      anther.position.set(Math.cos(angle) * 0.15, 1.45, Math.sin(angle) * 0.15)
      anther.rotation.x = Math.PI / 2
      stamen.add(anther)

      stamensGroup.add(stamen)
    }
    stamensGroup.visible = dissectionStep < 3
    flowerGroup.add(stamensGroup)

    // 5. Gynoecium / Pistil (Carpel: Ovary, Style, Stigma)
    const pistilGroup = new THREE.Group()
    pistilGroup.position.y = 0.2

    // Ovary at base
    const ovaryGeo = new THREE.SphereGeometry(0.48, 24, 24)
    const ovaryMat = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.3 })
    const ovary = new THREE.Mesh(ovaryGeo, ovaryMat)
    ovary.position.y = 0.45
    pistilGroup.add(ovary)

    // Style neck
    const styleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.6, 16)
    const styleMat = new THREE.MeshStandardMaterial({ color: 0xbbf7d0, roughness: 0.3 })
    const style = new THREE.Mesh(styleGeo, styleMat)
    style.position.y = 1.3
    pistilGroup.add(style)

    // 5-lobed Stigma on top
    const stigmaGeo = new THREE.SphereGeometry(0.24, 16, 16)
    const stigmaMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 })
    const stigma = new THREE.Mesh(stigmaGeo, stigmaMat)
    stigma.position.y = 2.15
    pistilGroup.add(stigma)

    // Step 4: Ovary cross section internal ovules
    if (dissectionStep === 4) {
      ovaryMat.transparent = true
      ovaryMat.opacity = 0.4
      const ovuleGeo = new THREE.SphereGeometry(0.09, 12, 12)
      const ovuleMat = new THREE.MeshStandardMaterial({ color: 0xfef08a })
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI * 2) / 6
        const ov = new THREE.Mesh(ovuleGeo, ovuleMat)
        ov.position.set(Math.cos(angle) * 0.2, 0.45, Math.sin(angle) * 0.2)
        pistilGroup.add(ov)
      }
    }

    flowerGroup.add(pistilGroup)
    scene.add(flowerGroup)

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
      flowerGroup.rotation.y += deltaX * 0.008
      flowerGroup.rotation.x += deltaY * 0.006
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
        flowerGroup.rotation.y += 0.004
      }
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
  }, [dissectionStep])

  const stepsInfo = [
    {
      title: 'Complete Intact Flower',
      badge: 'All 4 Floral Whorls',
      desc: 'Typical complete bisexual flower mounted on the thalamus with all accessory and reproductive whorls intact.',
    },
    {
      title: 'Step 1: Dissect Calyx (Sepals)',
      badge: 'Removed Whorl 1',
      desc: 'Green sepals removed. Calyx protects the floral bud during young stage and carries out photosynthesis.',
    },
    {
      title: 'Step 2: Dissect Corolla (Petals)',
      badge: 'Removed Whorl 2',
      desc: 'Petals removed. Corolla attracts insect pollinators via vivid pigmentation and nectar guide markings.',
    },
    {
      title: 'Step 3: Dissect Androecium (Stamens)',
      badge: 'Removed Whorl 3',
      desc: 'Stamens removed. Male microsporophylls consisting of filament and bilobed dithecous anthers shedding pollen.',
    },
    {
      title: 'Step 4: Longitudinal Ovary Dissection',
      badge: 'Gynoecium / Ovary Interior',
      desc: 'Ovary dissected longitudinally, revealing ovules attached to marginal placenta inside the locule.',
    },
  ]

  const activeStep = stepsInfo[dissectionStep]

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="card flex-1 p-5 lg:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-navy-800">
          <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
            3D Flower Dissection Workbench
          </h3>
          <span className="rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-bold text-pink-800 dark:bg-pink-950 dark:text-pink-300">
            {activeStep.badge}
          </span>
        </div>

        <div
          ref={mountRef}
          className="relative mt-4 h-80 w-full cursor-grab rounded-xl border border-slate-200 bg-navy-950 shadow-inner active:cursor-grabbing sm:h-96"
        >
          <div className="absolute left-3 top-3 rounded-lg bg-navy-900/85 px-3 py-2 text-xs backdrop-blur border border-white/10 pointer-events-none">
            <span className="text-slate-400">Current Stage: </span>
            <strong className="text-pink-300">{activeStep.title}</strong>
          </div>
        </div>

        {/* Step Selector Pills */}
        <div className="mt-5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Dissection Sequence:
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {[
              { step: 0, label: 'Intact' },
              { step: 1, label: '1. Sepals' },
              { step: 2, label: '2. Petals' },
              { step: 3, label: '3. Stamens' },
              { step: 4, label: '4. Ovules' },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setDissectionStep(s.step)}
                className={`rounded-lg px-2.5 py-2 text-xs font-bold transition-all border ${
                  dissectionStep === s.step
                    ? 'bg-pink-600 text-white border-pink-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-navy-800 dark:border-navy-700 dark:text-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column: Floral Anatomy Details */}
      <div className="card flex flex-col justify-between p-5 lg:w-[420px] lg:p-6">
        <div>
          <div className="border-b border-slate-100 pb-3 dark:border-navy-800">
            <span className="section-label">Floral Morphology</span>
            <h3 className="font-serif text-lg font-bold text-navy-900 dark:text-white mt-1">
              {activeStep.title}
            </h3>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {activeStep.desc}
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-navy-700 dark:bg-navy-900">
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                Floral Formula Component
              </span>
              <p className="mt-1 font-mono text-xs font-bold text-navy-900 dark:text-white">
                % ⚥ K(5) C1+2+(2) A(9)+1 G1 or ⊕ ⚥ K5 C5 A∞ G(5)
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-500/30 dark:bg-amber-950/20">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                <Icon name="sparkles" className="h-4 w-4" />
                <span>Mukesh Sir's NEET Botany Insight</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                In angiosperms, double fertilization produces a diploid zygote (2n) which matures into an embryo, and a triploid endosperm (3n) from triple fusion which nourishes the developing seed!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
