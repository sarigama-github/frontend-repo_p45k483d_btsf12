import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Simple driving experience: arrow/WASD to drive a car in a minimal world.
// Approach: physics-lite kinematics with acceleration, friction, turning.
export default function Game() {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const carRef = useRef(null)
  const keys = useRef({})
  const [activeZone, setActiveZone] = useState(null)
  const [ready, setReady] = useState(false)

  // Zones configuration
  const zones = [
    { id: 'projects', label: 'Projects', color: 0x60a5fa, pos: new THREE.Vector3(20, 0, -10), text: 'Selected projects: immersive UIs, 3D demos, and smooth motion.' },
    { id: 'school', label: 'School', color: 0x34d399, pos: new THREE.Vector3(-25, 0, -5), text: 'Education: CS-focused studies with web and graphics emphasis.' },
    { id: 'experience', label: 'Experience', color: 0xf59e0b, pos: new THREE.Vector3(0, 0, -30), text: 'Junior Software Engineer: building React apps with Three.js and motion.' },
    { id: 'soft', label: 'Soft Skills', color: 0xa78bfa, pos: new THREE.Vector3(25, 0, 15), text: 'Communication, curiosity, teamwork, and a bias for action.' },
    { id: 'hobbies', label: 'Hobbies', color: 0x22d3ee, pos: new THREE.Vector3(-18, 0, 18), text: '3D tinkering, gaming, photography, and learning new tech.' },
  ]

  // Drive state
  const velocity = useRef(0)
  const direction = useRef(0) // radians, 0 = -Z

  useEffect(() => {
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b1220')

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 8, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    mount.appendChild(renderer.domElement)

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223355, 0.8)
    scene.add(hemi)
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(5, 10, 2)
    scene.add(dirLight)

    // Ground
    const groundGeo = new THREE.PlaneGeometry(200, 200)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.2, roughness: 0.9 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Add subtle grid
    const grid = new THREE.GridHelper(200, 80, 0x1f2a44, 0x1f2a44)
    grid.position.y = 0.01
    scene.add(grid)

    // Car (simple body + wheels)
    const carGroup = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.5, 3),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.4 })
    )
    body.position.y = 0.4
    carGroup.add(body)

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.5, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.2, roughness: 0.6 })
    )
    cabin.position.set(0, 0.8, -0.6)
    carGroup.add(cabin)

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111827 })
    const addWheel = (x, z) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat)
      w.rotation.z = Math.PI / 2
      w.position.set(x, 0.25, z)
      carGroup.add(w)
      return w
    }
    addWheel(0.7, 1.2)
    addWheel(-0.7, 1.2)
    addWheel(0.7, -1.2)
    addWheel(-0.7, -1.2)

    scene.add(carGroup)

    // Zone markers
    const zoneMeshes = []
    zones.forEach((z) => {
      const m = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 0.2, 24),
        new THREE.MeshStandardMaterial({ color: z.color, transparent: true, opacity: 0.8 })
      )
      m.position.copy(z.pos)
      m.position.y = 0.11
      scene.add(m)

      // Floating label
      const label = new THREE.Mesh(
        new THREE.PlaneGeometry(3, 1),
        new THREE.MeshBasicMaterial({ color: z.color, transparent: true, opacity: 0.2 })
      )
      label.position.set(z.pos.x, 1.8, z.pos.z)
      scene.add(label)

      zoneMeshes.push({ id: z.id, mesh: m })
    })

    // Save refs
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    carRef.current = carGroup

    let raf
    const clock = new THREE.Clock()

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.033)

      // Controls
      const accel = (keys.current['ArrowUp'] || keys.current['w']) ? 12 : 0
      const brake = (keys.current['ArrowDown'] || keys.current['s']) ? 10 : 0
      const turnLeft = (keys.current['ArrowLeft'] || keys.current['a']) ? 1 : 0
      const turnRight = (keys.current['ArrowRight'] || keys.current['d']) ? 1 : 0

      // Update velocity with simple accel/brake and friction
      velocity.current += (accel - brake) * dt
      const friction = 4
      if (!accel && !brake) {
        const sign = Math.sign(velocity.current)
        velocity.current -= sign * friction * dt
        if (Math.sign(velocity.current) !== sign) velocity.current = 0
      }
      velocity.current = THREE.MathUtils.clamp(velocity.current, -12, 20)

      // Turning depends on speed
      const turnSpeed = 1.8
      const speedFactor = THREE.MathUtils.clamp(Math.abs(velocity.current) / 10, 0, 1)
      direction.current += (turnRight - turnLeft) * turnSpeed * speedFactor * dt * (velocity.current >= 0 ? 1 : -1)

      // Move car forward along its direction
      const forward = new THREE.Vector3(Math.sin(direction.current), 0, -Math.cos(direction.current))
      carGroup.position.add(forward.clone().multiplyScalar(velocity.current * dt))
      carGroup.rotation.y = direction.current

      // Camera follow (smooth)
      const camTarget = carGroup.position.clone().add(new THREE.Vector3(0, 6, 10).applyAxisAngle(new THREE.Vector3(0,1,0), direction.current))
      camera.position.lerp(camTarget, 0.08)
      const lookAt = carGroup.position.clone().add(new THREE.Vector3(0, 1.5, 0))
      camera.lookAt(lookAt)

      // Zone proximity detection
      const near = zoneMeshes.find(z => z.mesh.position.distanceTo(carGroup.position) < 2.0)
      if (near) {
        if (activeZone !== near.id) setActiveZone(near.id)
      } else {
        if (activeZone) setActiveZone(null)
      }

      renderer.render(scene, camera)
      raf = requestAnimationFrame(animate)
    }

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }

    window.addEventListener('resize', onResize)

    // Input handlers
    const down = (e) => { keys.current[e.key.toLowerCase()] = true }
    const up = (e) => { keys.current[e.key.toLowerCase()] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    setReady(true)
    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
      // dispose basic geometries/materials would go here if needed
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleTouch = (dir, pressed) => {
    const map = { up: 'arrowup', down: 'arrowdown', left: 'arrowleft', right: 'arrowright' }
    keys.current[map[dir]] = pressed
  }

  const zoneContent = {
    projects: {
      title: 'Projects',
      body: (
        <div className="space-y-2 text-sm text-blue-100">
          <p>- Interactive 3D Portfolio (Three.js + React)</p>
          <p>- Motion-rich landing pages (Framer Motion + GSAP)</p>
          <p>- UI component library experiments</p>
          <a href="#work" className="text-cyan-300 underline">See more below</a>
        </div>
      )
    },
    school: {
      title: 'Education',
      body: (
        <div className="space-y-2 text-sm text-blue-100">
          <p>Computer science coursework and self-driven graphics/WebGL learning.</p>
          <p>Focus: web engineering, UI/UX, and modern frontend tooling.</p>
        </div>
      )
    },
    experience: {
      title: 'Experience',
      body: (
        <div className="space-y-2 text-sm text-blue-100">
          <p>Junior Software Engineer building React applications with 3D and motion.</p>
          <p>Comfortable with TypeScript, Tailwind, and API integration.</p>
        </div>
      )
    },
    soft: {
      title: 'Soft Skills',
      body: (
        <ul className="list-disc pl-5 text-sm text-blue-100 space-y-1">
          <li>Curiosity & continuous learning</li>
          <li>Clear communication</li>
          <li>Collaboration & ownership</li>
          <li>Problem solving under constraints</li>
        </ul>
      )
    },
    hobbies: {
      title: 'Hobbies',
      body: (
        <ul className="list-disc pl-5 text-sm text-blue-100 space-y-1">
          <li>3D tinkering and shaders</li>
          <li>Gaming and driving sims</li>
          <li>Photography and design</li>
        </ul>
      )
    }
  }

  return (
    <section className="relative h-[80vh] md:h-[85vh] lg:h-[90vh] w-full select-none">
      <div ref={mountRef} className="h-full w-full rounded-xl overflow-hidden border border-white/10 bg-slate-900" />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4">
        <div className="flex items-center justify-between text-blue-100">
          <div className="backdrop-blur bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs">
            Drive with WASD/Arrows. Visit glowing pads to open sections.
          </div>
          <div className="text-right text-xs">
            <div className="font-semibold text-white">Sabri A</div>
            <div className="opacity-80">Junior Software Engineer</div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-3 pb-1">
          {/* Mobile controls */}
          <div className="pointer-events-auto grid grid-cols-3 gap-2">
            <button onTouchStart={() => handleTouch('left', true)} onTouchEnd={() => handleTouch('left', false)} className="w-12 h-12 rounded-lg bg-white/10 border border-white/15 text-white">◀</button>
            <button onTouchStart={() => handleTouch('up', true)} onTouchEnd={() => handleTouch('up', false)} className="w-12 h-12 rounded-lg bg-white/10 border border-white/15 text-white">▲</button>
            <button onTouchStart={() => handleTouch('right', true)} onTouchEnd={() => handleTouch('right', false)} className="w-12 h-12 rounded-lg bg-white/10 border border-white/15 text-white">▶</button>
            <div />
            <button onTouchStart={() => handleTouch('down', true)} onTouchEnd={() => handleTouch('down', false)} className="w-12 h-12 rounded-lg bg-white/10 border border-white/15 text-white col-start-2">▼</button>
          </div>
        </div>
      </div>

      {/* Zone modal */}
      {activeZone && (
        <div className="absolute inset-x-0 bottom-20 mx-auto w-[90%] max-w-xl">
          <div className="rounded-xl border border-white/15 bg-slate-900/90 backdrop-blur p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-lg">{zoneContent[activeZone]?.title}</h3>
              <button onClick={() => setActiveZone(null)} className="text-blue-200 hover:text-white">Close</button>
            </div>
            <div className="mt-3">
              {zoneContent[activeZone]?.body}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
