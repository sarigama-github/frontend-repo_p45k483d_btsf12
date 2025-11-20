import React, { useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Navbar() {
  useEffect(() => {
    const onScroll = () => {
      const nav = document.getElementById('nav')
      if (!nav) return
      if (window.scrollY > 10) nav.classList.add('backdrop-blur', 'bg-slate-900/60', 'border-b', 'border-white/10')
      else nav.classList.remove('backdrop-blur', 'bg-slate-900/60', 'border-b', 'border-white/10')
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header id="nav" className="fixed top-0 inset-x-0 z-50 transition-all">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14">
        <div className="flex h-16 items-center justify-between">
          <a href="#" className="flex items-center gap-2 text-white font-semibold">
            <img src="/favicon.svg" alt="logo" className="h-6 w-6" />
            <span>My Portfolio</span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm text-blue-100">
            <a href="#work" className="hover:text-white">Work</a>
            <a href="#about" className="hover:text-white">About</a>
            <a href="#contact" className="hover:text-white">Contact</a>
            <a href="/test" className="text-blue-300 hover:text-white">Test</a>
          </nav>

          <button className="md:hidden text-white" aria-label="Menu">
            <Menu />
          </button>
        </div>
      </div>
    </header>
  )
}
