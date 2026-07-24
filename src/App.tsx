import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Deck } from './components/Deck'
import { Mixer } from './components/Mixer'
import { Library } from './components/Library'
import { LogoText } from './components/LogoText'

function App() {
  // Initialize dark mode based on system preferences
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  // Sync theme with document class list
  useEffect(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDarkMode])

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-hidden flex flex-col p-8 select-none transition-colors duration-300">
      
      {/* Title / Header Bar */}
      <header className="flex justify-between items-center mb-6 w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Emblem (Helium Logo) */}
          <img src="/logo-emblem.svg" alt="Helium Emblem" className="w-8 h-8 object-contain" />
          {/* Text Logo */}
          <LogoText className="h-6 w-auto text-text-primary" />
          <span className="text-[9px] font-mono font-bold tracking-widest text-text-secondary/60 ml-2">
            H.01 // TE EDITION
          </span>
        </div>

        {/* Tactile Hardware-style controls (Theme Toggle / Power / About) */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border-te)] bg-surface text-[10px] uppercase font-mono font-bold cursor-pointer hover:bg-background/40 transition-colors shadow-soft"
          >
            <span
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                isDarkMode ? 'bg-accent' : 'bg-accent-secondary'
              }`}
            />
            {isDarkMode ? 'LIGHT MODE' : 'DARK MODE'}
          </button>
          
          {/* Pocket Operator Style Power Key */}
          <div className="w-8 h-8 rounded-full border border-[var(--border-te)] flex items-center justify-center bg-surface shadow-soft text-[10px] font-bold text-text-secondary/60 hover:text-text-primary cursor-pointer active:scale-95 transition-transform duration-75">
            POW
          </div>
        </div>
      </header>

      {/* Main DJ Surface Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col gap-6 items-center justify-center">
        {/* Upper Rack: Deck A, Mixer, Deck B */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="flex justify-between items-center w-full gap-6 flex-wrap lg:flex-nowrap"
        >
          <Deck id="A" color="var(--accent)" />
          <Mixer />
          <Deck id="B" color="var(--accent-secondary)" />
        </motion.div>

        {/* Lower Rack: Library */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full"
        >
          <Library />
        </motion.div>
      </main>

      {/* Aesthetic Bottom Footer Info */}
      <footer className="w-full max-w-7xl mx-auto flex justify-between items-center mt-6 text-[9px] font-mono text-text-secondary/40 font-bold">
        <span>TEENAGE ENGINEERING SYSTEM DESIGN // INSPIRATION ONLY</span>
        <span>LATENCY: LOW // CPAL ACTIVE // SAMPLE RATE: 44.1KHZ</span>
        <span>VER. 0.1.0</span>
      </footer>
    </div>
  )
}

export default App
