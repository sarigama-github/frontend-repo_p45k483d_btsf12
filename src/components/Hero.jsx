import React, { useEffect, useRef } from 'react'
import Spline from '@splinetool/react-spline'
import { motion } from 'framer-motion'
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react'

function useParallaxTilt(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const handle = (e) => {
      const { innerWidth: w, innerHeight: h } = window
      const x = (e.clientX - w / 2) / (w / 2)
      const y = (e.clientY - h / 2) / (h / 2)
      el.style.setProperty('--rx', `${(-y * 6).toFixed(2)}deg`)
      el.style.setProperty('--ry', `${(x * 8).toFixed(2)}deg`)
    }
    window.addEventListener('pointermove', handle)
    return () => window.removeEventListener('pointermove', handle)
  }, [ref])
}

export default function Hero() {
  const containerRef = useRef(null)
  useParallaxTilt(containerRef)

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      </div>

      <div ref={containerRef} className="relative z-10 w-full grid lg:grid-cols-2 gap-8 items-center px-6 sm:px-10 md:px-14" style={{ perspective: '1000px' }}>
        <div className="py-10" style={{ transform: 'rotateX(var(--rx)) rotateY(var(--ry))', transformStyle: 'preserve-3d' }}>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white"
            style={{ transform: 'translateZ(40px)' }}
          >
            Hi, I’m <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Sabri A</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mt-4 text-lg md:text-xl text-blue-100/90 max-w-xl"
            style={{ transform: 'translateZ(30px)' }}
          >
            Junior software engineer crafting playful, immersive web experiences with React, Three.js, and motion.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 flex flex-wrap gap-3"
            style={{ transform: 'translateZ(20px)' }}
          >
            <a href="#work" className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors">
              View Work <ArrowRight size={18} />
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-3 rounded-lg backdrop-blur border border-white/15 transition-colors">
              Contact
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 flex items-center gap-4 text-blue-100"
            style={{ transform: 'translateZ(10px)' }}
          >
            <a href="https://github.com" target="_blank" className="hover:text-white transition-colors" aria-label="GitHub"><Github /></a>
            <a href="https://linkedin.com" target="_blank" className="hover:text-white transition-colors" aria-label="LinkedIn"><Linkedin /></a>
            <a href="mailto:you@example.com" className="hover:text-white transition-colors" aria-label="Email"><Mail /></a>
          </motion.div>
        </div>

        <div className="relative h-[60vh] sm:h-[70vh] lg:h-[80vh] w-full">
          <Spline scene="https://prod.spline.design/VJLoxp84lCdVfdZu/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </section>
  )
}
