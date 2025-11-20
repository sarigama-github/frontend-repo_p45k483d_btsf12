import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Game from './components/Game'
import Sections from './components/Sections'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.18),transparent_30%)] pointer-events-none" />
      <Navbar />
      <main className="relative pt-16 space-y-16">
        <Hero />
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Explore my world</h2>
          <p className="text-blue-200 mb-6">Drive the car to glowing pads to reveal sections about my projects, education, experience, soft skills, and hobbies.</p>
        </div>
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14">
          <Game />
        </div>
        <Sections />
      </main>
      <Footer />
    </div>
  )
}

export default App
