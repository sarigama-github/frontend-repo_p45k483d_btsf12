import React from 'react'

export default function Footer() {
  return (
    <footer className="py-10 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14 flex items-center justify-between text-blue-200">
        <p>© {new Date().getFullYear()} Your Name. All rights reserved.</p>
        <a href="#" className="hover:text-white">Back to top ↑</a>
      </div>
    </footer>
  )
}
