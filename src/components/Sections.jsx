import React, { useEffect, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function Sections() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40])
  const y2 = useTransform(scrollYProgress, [0, 1], [60, -60])

  return (
    <div ref={ref} className="relative">
      <section id="work" className="py-24 md:py-36">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14">
          <motion.h2 style={{ y: y1 }} className="text-3xl md:text-4xl font-bold text-white">Selected Work</motion.h2>
          <motion.p style={{ y: y2 }} className="mt-3 text-blue-200 max-w-2xl">A few projects showcasing interactive 3D, GSAP/Framer motion, and thoughtful UX.</motion.p>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            {[1,2,3,4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur p-6"
              >
                <div className="h-40 rounded-lg bg-gradient-to-br from-blue-500/30 to-cyan-400/30" />
                <div className="mt-4">
                  <h3 className="text-white font-semibold">Project {i}</h3>
                  <p className="text-blue-200 text-sm">Interactive demo with snappy motion and 3D elements.</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-24 md:py-36 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14">
          <motion.h2 style={{ y: y1 }} className="text-3xl md:text-4xl font-bold text-white">About</motion.h2>
          <motion.p style={{ y: y2 }} className="mt-3 text-blue-200 max-w-2xl">I love building immersive web products using WebGL, shaders, and tasteful motion. Let’s collaborate on something memorable.</motion.p>

          <div className="mt-8 grid sm:grid-cols-2 gap-6">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-blue-100">10+ projects shipped with 3D and motion</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-blue-100">Performance-first mindset</div>
          </div>
        </div>
      </section>

      <section id="contact" className="py-24 md:py-36 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14">
          <motion.h2 style={{ y: y1 }} className="text-3xl md:text-4xl font-bold text-white">Contact</motion.h2>
          <motion.p style={{ y: y2 }} className="mt-3 text-blue-200 max-w-2xl">Open to freelance, full-time, and collabs. Email me and let’s talk.</motion.p>

          <form className="mt-10 grid gap-4 max-w-xl">
            <input className="bg-white/10 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Your name" />
            <input className="bg-white/10 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Email" type="email" />
            <textarea className="bg-white/10 border border-white/15 rounded-lg px-4 py-3 text-white placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-blue-500/50" placeholder="Message" rows="5" />
            <button className="w-fit bg-blue-500 hover:bg-blue-600 text-white font-semibold px-5 py-3 rounded-lg transition-colors">Send</button>
          </form>
        </div>
      </section>
    </div>
  )
}
