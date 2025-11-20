import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Bruno‑style vibe: playful driving sandbox with portals, collectibles, smooth follow camera.
// Controls: WASD / Arrow keys. Mobile touch D‑pad included.
export default function Game() {
  const mountRef = useRef(null)
  const rendererRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const carRef = useRef(null)
  const keys = useRef({})

  const [activeZone, setActiveZone] = useState(null)
  const [coins, setCoins] = useState(0)
  const [speedKmh, setSpeedKmh] = useState(0)

  // Zones: portals that open contextual panels
  const zones = [
    { id: 'projects', label: 'Projects', color: 0x60a5fa, pos: new THREE.Vector3(24, 0, -10) },
    { id: 'school', label: 'Education', color: 0x34d399, pos: new THREE.Vector3(-28, 0, -4) },
    { id: 'experience', label: 'Experience', color: 0xf59e0b, pos: new THREE.Vector3(0, 0, -34) },
    { id: 'soft', label: 'Soft Skills', color: 0xa78bfa, pos: new THREE.Vector3(28, 0, 16) },
    { id: 'hobbies', label: 'Hobbies', color: 0x22d3ee, pos: new THREE.Vector3(-20, 0, 22) },
  ]

  // Vehicle state (simple arcade physics with drift feel)
  const state = useRef({
    pos: new THREE.Vector3(0, 0, 0),
    dir: 0, // radians, 0 = -Z
    vel: 0, // forward velocity (m/s)
    angVel: 0,
  })

  useEffect(() => {
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0a0f1e')

    // Fog for depth
    scene.fog = new THREE.Fog(0x0a0f1e, 40, 160)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 8, 12)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    // Lights
    const hemi = new THREE.HemisphereLight(0xffffff, 0x223355, 0.8)
    scene.add(hemi)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9)
    dirLight.position.set(20, 30, 10)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.set(1024, 1024)
    scene.add(dirLight)

    // Ground
    const groundGeo = new THREE.PlaneGeometry(240, 240)
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.1, roughness: 0.95 })
    const ground = new THREE.Mesh(groundGeo, groundMat)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Decorative track lines
    const grid = new THREE.GridHelper(240, 120, 0x1f2a44, 0x13223d)
    grid.position.y = 0.01
    scene.add(grid)

    // World bounds (low‑poly neon barriers)
    const walls = new THREE.Group()
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: new THREE.Color('#0ea5e9'), emissiveIntensity: 0.2, metalness: 0.3, roughness: 0.6 })
    const makeWall = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wallMat)
      m.position.set(x, y, z)
      m.castShadow = true
      m.receiveShadow = true
      walls.add(m)
      return m
    }
    const half = 55
    makeWall(120, 2, 1, 0, 1, -half)
    makeWall(120, 2, 1, 0, 1, half)
    makeWall(1, 2, 120, -half, 1, 0)
    makeWall(1, 2, 120, half, 1, 0)
    scene.add(walls)

    // Ramps for fun
    const rampMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.1, roughness: 0.7 })
    const ramp1 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 10), rampMat)
    ramp1.position.set(-18, 0.4, -14)
    ramp1.rotation.x = -0.25
    scene.add(ramp1)
    const ramp2 = new THREE.Mesh(new THREE.BoxGeometry(6, 0.8, 10), rampMat)
    ramp2.position.set(18, 0.4, 14)
    ramp2.rotation.x = -0.2
    scene.add(ramp2)

    // Car (simple stylized body + cabin + wheels)
    const carGroup = new THREE.Group()
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 0.6, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.35 })
    )
    body.position.y = 0.5
    body.castShadow = true
    body.receiveShadow = true
    carGroup.add(body)

    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.6, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x93c5fd, metalness: 0.2, roughness: 0.6 })
    )
    cabin.position.set(0, 0.95, -0.5)
    cabin.castShadow = true
    carGroup.add(cabin)

    const wheelGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.42, 16)
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0b1220, metalness: 0.2, roughness: 0.8 })
    const addWheel = (x, z) => {
      const w = new THREE.Mesh(wheelGeo, wheelMat)
      w.rotation.z = Math.PI / 2
      w.position.set(x, 0.28, z)
      w.castShadow = true
      carGroup.add(w)
      return w
    }
    addWheel(0.75, 1.25)
    addWheel(-0.75, 1.25)
    addWheel(0.75, -1.25)
    addWheel(-0.75, -1.25)
    scene.add(carGroup)

    // Portals (arches + pad + floating label)
    const portals = []
    zones.forEach((z) => {
      const group = new THREE.Group()
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(1.4, 1.4, 0.2, 24),
        new THREE.MeshStandardMaterial({ color: z.color, transparent: true, opacity: 0.85 })
      )
      pad.position.y = 0.11
      group.add(pad)

      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(1.6, 0.12, 12, 48, Math.PI),
        new THREE.MeshStandardMaterial({ color: z.color, emissive: new THREE.Color(z.color), emissiveIntensity: 0.15 })
      )
      arch.rotation.x = Math.PI
      arch.position.y = 1.35
      group.add(arch)

      const sign = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.6, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x111827 })
      )
      sign.position.set(0, 2.1, 0)
      group.add(sign)

      group.position.copy(z.pos)
      scene.add(group)
      portals.push({ id: z.id, color: z.color, group })
    })

    // Collectibles
    const coinGroup = new THREE.Group()
    const coinMat = new THREE.MeshStandardMaterial({ color: 0xfde047, emissive: new THREE.Color('#fde047'), emissiveIntensity: 0.25, metalness: 0.4, roughness: 0.3 })
    const coinGeo = new THREE.TorusGeometry(0.35, 0.12, 12, 24)
    const coinPositions = [
      new THREE.Vector3(0, 0.6, 0),
      new THREE.Vector3(8, 0.6, -6),
      new THREE.Vector3(-10, 0.6, 8),
      new THREE.Vector3(20, 0.6, 0),
      new THREE.Vector3(-20, 0.6, 14),
    ]
    const coinsMeshes = coinPositions.map((p, i) => {
      const c = new THREE.Mesh(coinGeo, coinMat)
      c.position.copy(p)
      c.rotation.x = Math.PI / 2
      c.userData.index = i
      coinGroup.add(c)
      return c
    })
    scene.add(coinGroup)

    // Save refs
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    carRef.current = carGroup

    // Animation
    let raf
    const clock = new THREE.Clock()

    const params = {
      accel: 14, // m/s^2
      brake: 12,
      maxSpeed: 24,
      turnRate: 2.2, // rad/s at speedFactor=1
      friction: 3.5, // passive slowdown
      drift: 5.5, // lateral damping (higher = less drift)
      camLag: 0.1,
    }

    // Simple AABB for walls collision
    const bounds = { minX: -55 + 2, maxX: 55 - 2, minZ: -55 + 2, maxZ: 55 - 2 }

    const tmpForward = new THREE.Vector3()

    const animate = () => {
      const dt = Math.min(clock.getDelta(), 0.033)

      // Inputs
      const fwd = (keys.current['arrowup'] || keys.current['w']) ? 1 : 0
      const back = (keys.current['arrowdown'] || keys.current['s']) ? 1 : 0
      const left = (keys.current['arrowleft'] || keys.current['a']) ? 1 : 0
      const right = (keys.current['arrowright'] || keys.current['d']) ? 1 : 0

      // Forward speed
      const st = state.current
      st.vel += (fwd * params.accel - back * params.brake) * dt

      // Passive friction when no input
      if (!fwd && !back) {
        const sign = Math.sign(st.vel)
        st.vel -= sign * params.friction * dt
        if (Math.sign(st.vel) !== sign) st.vel = 0
      }
      st.vel = THREE.MathUtils.clamp(st.vel, -params.maxSpeed * 0.5, params.maxSpeed)

      // Turning – scales with speed
      const speedFactor = THREE.MathUtils.clamp(Math.abs(st.vel) / params.maxSpeed, 0, 1)
      st.dir += (right - left) * params.turnRate * speedFactor * dt * (st.vel >= 0 ? 1 : -1)

      // Drift feel: damp sideways slip by blending direction slowly
      // (Arcade approximation: not full lateral velocity model)

      // Integrate position
      tmpForward.set(Math.sin(st.dir), 0, -Math.cos(st.dir))
      st.pos.addScaledVector(tmpForward, st.vel * dt)

      // Collide with bounds
      st.pos.x = THREE.MathUtils.clamp(st.pos.x, bounds.minX, bounds.maxX)
      st.pos.z = THREE.MathUtils.clamp(st.pos.z, bounds.minZ, bounds.maxZ)

      // Update car transform
      carGroup.position.lerp(st.pos, 0.6) // slight smoothing to reduce jitter
      carGroup.rotation.y = st.dir

      // Camera follow (springy)
      const ideal = st.pos.clone().add(new THREE.Vector3(0, 6, 10).applyAxisAngle(new THREE.Vector3(0,1,0), st.dir))
      camera.position.lerp(ideal, params.camLag)
      camera.lookAt(st.pos.x, st.pos.y + 1.5, st.pos.z)

      // Update speed HUD
      setSpeedKmh(Math.round(Math.abs(st.vel) * 3.6))

      // Portal proximity
      const nearPortal = portals.find(p => p.group.position.distanceTo(st.pos) < 2)
      if (nearPortal) {
        if (activeZone !== nearPortal.id) setActiveZone(nearPortal.id)
      } else {
        if (activeZone) setActiveZone(null)
      }

      // Spin coins + pickup
      coinsMeshes.forEach((c) => {
        if (!c.visible) return
        c.rotation.z += 2 * dt
        if (c.position.distanceTo(st.pos) < 1.2) {
          c.visible = false
          setCoins((n) => n + 1)
        }
      })

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

    // Initialize car state
    state.current.pos.set(0, 0, 20)
    state.current.dir = Math.PI // face +Z then rotate to face -Z when starting to drive

    animate()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      mount.removeChild(renderer.domElement)
      renderer.dispose()
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
          <p>- 3D portfolio playground (React + Three.js)</p>
          <p>- Motion micro‑interactions (Framer Motion / GSAP)</p>
          <p>- UI systems and design tokens</p>
          <a href="#work" className="text-cyan-300 underline">See featured work</a>
        </div>
      )
    },
    school: {
      title: 'Education',
      body: (
        <div className="space-y-2 text-sm text-blue-100">
          <p>Computer science foundations with a focus on web engineering and graphics.</p>
          <p>Self‑driven learning in WebGL and rendering.</p>
        </div>
      )
    },
    experience: {
      title: 'Experience',
      body: (
        <div className="space-y-2 text-sm text-blue-100">
          <p>Junior software engineer building immersive, performant web apps.</p>
          <p>Comfortable across React, TypeScript, Tailwind, API integration.</p>
        </div>
      )
    },
    soft: {
      title: 'Soft Skills',
      body: (
        <ul className="list-disc pl-5 text-sm text-blue-100 space-y-1">
          <li>Curiosity and rapid learning</li>
          <li>Clear communication</li>
          <li>Collaboration and ownership</li>
          <li>Problem solving under constraints</li>
        </ul>
      )
    },
    hobbies: {
      title: 'Hobbies',
      body: (
        <ul className="list-disc pl-5 text-sm text-blue-100 space-y-1">
          <li>3D tinkering and shaders</li>
          <li>Racing games and driving sims</li>
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
            Drive with WASD/Arrows. Collect coins. Enter glowing portals to open sections.
          </div>
          <div className="text-right text-xs">
            <div className="font-semibold text-white">Sabri A</div>
            <div className="opacity-80">Junior Software Engineer</div>
          </div>
        </div>
        <div className="flex items-center justify-between px-2 pb-1">
          <div className="pointer-events-auto grid grid-cols-3 gap-2">
            <button onTouchStart={() => handleTouch('left', true)} onTouchEnd={() => handleTouch('left', false)} className="w-12 h-12 rounded-lg bg-white/10 border border-white/15 text-white">◀</button>
            <button onTouchStart={() => handleTouch('up', true)} onTouchEnd={() => handleTouch('up', false)} className="w-12 h-12 rounded-lg bg-white/10 border border-white/15 text-white">▲</button>
            <button onTouchStart={() => handleTouch('right', true)} onTouchEnd={() => handleTouch('right', false)} className="w-12 h-12 rounded-lg bg-white/10 border border-white/15 text-white">▶</button>
            <div />
            <button onTouchStart={() => handleTouch('down', true)} onTouchEnd={() => handleTouch('down', false)} className="w-12 h-12 rounded-lg bg-white/10 border border-white/15 text-white col-start-2">▼</button>
          </div>
          <div className="pointer-events-none flex items-center gap-3 text-xs">
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
              Speed <span className="font-semibold text-white">{speedKmh}</span> km/h
            </div>
            <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
              Coins <span className="font-semibold text-yellow-300">{coins}</span>
            </div>
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
