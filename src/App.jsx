import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Sections from './components/Sections'
import Footer from './components/Footer'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.18),transparent_30%)] pointer-events-none" />
      <Navbar />
      <main className="relative pt-16">
        <Hero />
        <Sections />
      </main>
      <Footer />
    </div>
  )
}

export default App
