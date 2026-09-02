import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import Icon from '../Icon'
import { organelleData, OrganelleInfo } from '../../data/virtualLab'

export default function CellModel3D() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [cellType, setCellType] = useState<'plant' | 'animal'>('plant')
  const [selectedOrganelle, setSelectedOrganelle] = useState<OrganelleInfo>(organelleData[0])
  const [sliceView, setSliceView] = useState<boolean>(true)
  const [autoRotate, setAutoRotate] = useState<boolean>(true)

  // Filter organelles based on current cell type
  const activeOrganelles = organelleData.filter(
    (o) => o.cellKind === 'both' || o.cellKind === cellType
  )

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 500
    const height = container.clientHeight || 450

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x071426) // navy-950

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100)
    camera.position.set(0, 3.8, 6.2)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3)
    scene.add(ambientLight)

    const keyLight = new THREE.DirectionalLight(0x22d3ee, 2.2)
    keyLight.position.set(5, 8, 4)
    scene.add(keyLight)

    const backLight = new THREE.PointLight(0x3b82f6, 1.8)
    backLight.position.set(-5, -2, -4)
    scene.add(backLight)

    // Main Cell Group
    const cellGroup = new THREE.Group()

    if (cellType === 'plant') {
      // 1. Plant Cell Wall (Hexagonal / Rectangular outer shell)
      const wallGeo = new THREE.BoxGeometry(4.2, 3.2, sliceView ? 2.0 : 3.6)
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x84cc16,
        roughness: 0.4,
        transparent: true,
        opacity: 0.35,
        wireframe: false,
      })
      const wallMesh = new THREE.Mesh(wallGeo, wallMat)
      cellGroup.add(wallMesh)

      // Cell wall wireframe edge highlight
      const edgeGeo = new THREE.EdgesGeometry(wallGeo)
      const edgeMat = new THREE.LineBasicMaterial({ color: 0xbef264, linewidth: 2 })
      const edgeLines = new THREE.LineSegments(edgeGeo, edgeMat)
      cellGroup.add(edgeLines)

      // 2. Large Central Vacuole (Cyan translucent bubble)
      const vacGeo = new THREE.SphereGeometry(1.35, 32, 32)
      const vacMat = new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        transmission: 0.8,
        opacity: 0.65,
        transparent: true,
        roughness: 0.1,
      })
      const vacMesh = new THREE.Mesh(vacGeo, vacMat)
      vacMesh.position.set(-0.5, 0.1, 0)
      vacMesh.scale.set(1.1, 1.0, 0.9)
      cellGroup.add(vacMesh)

      // 3. Nucleus (Pushed to periphery by large vacuole)
      const nucGroup = new THREE.Group()
      nucGroup.position.set(1.3, 0.5, 0.2)
      const nucGeo = new THREE.SphereGeometry(0.65, 32, 32)
      const nucMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 })
      const nucMesh = new THREE.Mesh(nucGeo, nucMat)
      nucGroup.add(nucMesh)

      // Nucleolus
      const nucleolusGeo = new THREE.SphereGeometry(0.24, 16, 16)
      const nucleolusMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a })
      const nucleolusMesh = new THREE.Mesh(nucleolusGeo, nucleolusMat)
      nucleolusMesh.position.set(0.1, 0.1, 0.1)
      nucGroup.add(nucleolusMesh)
      cellGroup.add(nucGroup)

      // 4. Chloroplasts (Green ovoids with internal grana)
      const chloroPositions = [
        [1.2, -0.8, 0.4],
        [0.8, 1.0, -0.3],
        [-1.4, 0.9, 0.4],
        [-1.2, -0.9, -0.3],
      ]
      chloroPositions.forEach(([x, y, z]) => {
        const chloroGeo = new THREE.SphereGeometry(0.35, 24, 16)
        const chloroMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.3 })
        const chloroMesh = new THREE.Mesh(chloroGeo, chloroMat)
        chloroMesh.position.set(x, y, z)
        chloroMesh.scale.set(1.3, 0.8, 0.6)
        cellGroup.add(chloroMesh)
      })

      // 5. Mitochondria (Red ovoids)
      const mitoPositions = [
        [0.4, -0.9, 0.3],
        [1.3, 0.0, -0.5],
        [-0.3, 1.1, 0.4],
      ]
      mitoPositions.forEach(([x, y, z]: number[]) => {
        const mitoGeo = new THREE.CapsuleGeometry(0.18, 0.38, 8, 16)
        const mitoMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
        const mitoMesh = new THREE.Mesh(mitoGeo, mitoMat)
        mitoMesh.position.set(x, y, z)
        mitoMesh.rotation.z = Math.PI / 4
        cellGroup.add(mitoMesh)
      })
    } else {
      // Animal Cell Mode: Irregular spherical outline
      const cellGeo = new THREE.SphereGeometry(2.3, 32, 32, 0, Math.PI * 2, 0, sliceView ? Math.PI * 0.65 : Math.PI)
      const cellMat = new THREE.MeshPhysicalMaterial({
        color: 0x14b8a6,
        transparent: true,
        opacity: 0.35,
        roughness: 0.3,
        side: THREE.DoubleSide,
      })
      const cellMesh = new THREE.Mesh(cellGeo, cellMat)
      cellGroup.add(cellMesh)

      // Central Nucleus
      const nucGroup = new THREE.Group()
      nucGroup.position.set(0, 0, 0)
      const nucGeo = new THREE.SphereGeometry(0.85, 32, 32)
      const nucMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 })
      const nucMesh = new THREE.Mesh(nucGeo, nucMat)
      nucGroup.add(nucMesh)

      const nucleolusGeo = new THREE.SphereGeometry(0.3, 16, 16)
      const nucleolusMat = new THREE.MeshBasicMaterial({ color: 0x1e3a8a })
      const nucleolusMesh = new THREE.Mesh(nucleolusGeo, nucleolusMat)
      nucleolusMesh.position.set(0.15, 0.15, 0.15)
      nucGroup.add(nucleolusMesh)
      cellGroup.add(nucGroup)

      // Abundant Mitochondria
      const mitoPositions = [
        [1.2, 0.7, 0.5],
        [-1.3, -0.6, 0.4],
        [0.8, -1.2, -0.4],
        [-0.9, 1.1, -0.3],
        [1.4, -0.5, 0.6],
      ]
      mitoPositions.forEach(([x, y, z]: number[]) => {
        const mitoGeo = new THREE.CapsuleGeometry(0.2, 0.45, 8, 16)
        const mitoMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 })
        const mitoMesh = new THREE.Mesh(mitoGeo, mitoMat)
        mitoMesh.position.set(x, y, z)
        mitoMesh.rotation.x = Math.PI / 3
        cellGroup.add(mitoMesh)
      })

      // Centrioles / Centrosome (Animal cell specific!)
      const centrosome = new THREE.Group()
      centrosome.position.set(0.8, 1.0, 0.2)
      const centrioleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.4, 12)
      const centrioleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.5 })

      const c1 = new THREE.Mesh(centrioleGeo, centrioleMat)
      const c2 = new THREE.Mesh(centrioleGeo, centrioleMat)
      c2.rotation.x = Math.PI / 2
      centrosome.add(c1)
      centrosome.add(c2)
      cellGroup.add(centrosome)

      // Small scattered vacuoles
      const vac1Geo = new THREE.SphereGeometry(0.3, 16, 16)
      const vacMat = new THREE.MeshPhysicalMaterial({ color: 0x06b6d4, opacity: 0.6, transparent: true })
      const v1 = new THREE.Mesh(vac1Geo, vacMat)
      v1.position.set(-1.1, 0.4, -0.8)
      cellGroup.add(v1)
    }

    scene.add(cellGroup)

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
      cellGroup.rotation.y += deltaX * 0.008
      cellGroup.rotation.x += deltaY * 0.008
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

    // Touch support for mobile devices
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true
        prevMouseX = e.touches[0].clientX
        prevMouseY = e.touches[0].clientY
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return
      const deltaX = e.touches[0].clientX - prevMouseX
      const deltaY = e.touches[0].clientY - prevMouseY
      cellGroup.rotation.y += deltaX * 0.008
      cellGroup.rotation.x += deltaY * 0.008
      prevMouseX = e.touches[0].clientX
      prevMouseY = e.touches[0].clientY
    }
    const onTouchEnd = () => {
      isDragging = false
    }
    domEl.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('touchend', onTouchEnd)

    let animId: number
    const animate = () => {
      animId = requestAnimationFrame(animate)
      if (autoRotate && !isDragging) {
        cellGroup.rotation.y += 0.005
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
      domEl.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      renderer.dispose()
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement)
      }
    }
  }, [cellType, sliceView, autoRotate])

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* 3D Model Display */}
      <div className="card flex-1 p-5 lg:p-6">
        {/* Header toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-navy-800">
          {/* Cell Mode Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 p-1 dark:bg-navy-800">
            <button
              type="button"
              onClick={() => setCellType('plant')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                cellType === 'plant'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon name="leaf" className="h-3.5 w-3.5" />
              <span>Plant Cell (3D)</span>
            </button>
            <button
              type="button"
              onClick={() => setCellType('animal')}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                cellType === 'animal'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Icon name="atom" className="h-3.5 w-3.5" />
              <span>Animal Cell (3D)</span>
            </button>
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSliceView(!sliceView)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                sliceView
                  ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-cyan-950/60 dark:border-cyan-500/40 dark:text-cyan-300'
                  : 'border-slate-200 text-slate-600 dark:border-navy-700 dark:text-slate-400'
              }`}
            >
              {sliceView ? 'Cutaway View: ON' : 'Cutaway View: OFF'}
            </button>

            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              aria-label="Toggle auto rotation"
              className={`rounded-lg p-1.5 border transition-colors ${
                autoRotate
                  ? 'bg-brand-50 border-brand-300 text-brand-700 dark:bg-cyan-950/60 dark:border-cyan-500/40 dark:text-cyan-300'
                  : 'border-slate-200 text-slate-600 dark:border-navy-700 dark:text-slate-400'
              }`}
            >
              <Icon name="clock" className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3D WebGL Canvas Viewport */}
        <div
          ref={mountRef}
          className="relative mt-4 h-80 w-full cursor-grab rounded-xl border border-slate-200 bg-navy-950 shadow-inner active:cursor-grabbing sm:h-96"
        >
          {/* On-canvas info overlay */}
          <div className="absolute left-3 top-3 rounded-lg bg-navy-900/80 px-2.5 py-1 text-xs text-cyan-300 backdrop-blur border border-cyan-500/20 pointer-events-none">
            Viewing: <strong className="text-white capitalize">{cellType} Cell</strong>
          </div>
          <div className="absolute bottom-3 right-3 text-[11px] text-slate-400 pointer-events-none">
            Click organelles on the right to inspect biochemical functions
          </div>
        </div>

        {/* Quick Comparison Bar */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs dark:border-navy-800 dark:bg-navy-900/40">
          <span className="font-bold text-navy-900 dark:text-white">Distinctive Features: </span>
          {cellType === 'plant' ? (
            <span className="text-slate-600 dark:text-slate-300">
              Rigid cellulose cell wall, large central vacuole (up to 90% volume), and photosynthesizing chloroplasts.
            </span>
          ) : (
            <span className="text-slate-600 dark:text-slate-300">
              Absence of cell wall and plastids; presence of centrioles/centrosomes for cell division and small scattered vacuoles.
            </span>
          )}
        </div>
      </div>

      {/* Right Column: Organelle Inspector & NEET Focus */}
      <div className="card flex flex-col justify-between p-5 lg:w-[420px] lg:p-6">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-navy-800">
            <h3 className="font-serif text-base font-bold text-navy-900 dark:text-white">
              Organelle Inspector
            </h3>
            <span className="rounded-full bg-cyan-100 px-2.5 py-0.5 text-xs font-bold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
              Interactive
            </span>
          </div>

          {/* Organelle Chips Selection */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeOrganelles.map((organelle) => {
              const isSelected = selectedOrganelle.id === organelle.id
              return (
                <button
                  key={organelle.id}
                  type="button"
                  onClick={() => setSelectedOrganelle(organelle)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all border ${
                    isSelected
                      ? 'bg-navy-900 text-white border-navy-900 shadow-sm dark:bg-cyan-400 dark:text-navy-950 dark:border-cyan-400'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 dark:bg-navy-800 dark:border-navy-700 dark:text-slate-300'
                  }`}
                >
                  {organelle.name.split(' ')[0]}
                </button>
              )
            })}
          </div>

          {/* Active Organelle Detailed Dossier */}
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shadow-sm"
                  style={{ backgroundColor: selectedOrganelle.color }}
                />
                <h4 className="font-serif text-lg font-bold text-navy-900 dark:text-white">
                  {selectedOrganelle.name}
                </h4>
              </div>
              <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:bg-navy-800 dark:text-slate-400">
                Found in: {selectedOrganelle.cellKind === 'both' ? 'Plant & Animal Cells' : `${selectedOrganelle.cellKind} Cells Only`}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-navy-700 dark:bg-navy-900">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                Core Biological Function
              </span>
              <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                {selectedOrganelle.function}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-navy-700 dark:bg-navy-900">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-cyan-400">
                Ultrastructure Details
              </span>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {selectedOrganelle.structure}
              </p>
            </div>

            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-500/30 dark:bg-amber-950/20">
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Icon name="sparkles" className="h-3.5 w-3.5" />
                <span>Mukesh Sir's NEET & Board Key Note</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                {selectedOrganelle.neetFocus}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
