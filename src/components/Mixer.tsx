import React from 'react'
import { useDJStore } from '../store/useDJStore'
import { Knob } from './Knob'
import { Crossfader } from './Crossfader'

export const Mixer: React.FC = () => {
  const store = useDJStore()

  return (
    <div className="matte-surface p-6 flex flex-col justify-between items-center h-[460px] w-[340px] select-none">
      {/* Top Header - Mixer title & Limiter toggle */}
      <div className="flex justify-between items-center w-full pb-3 border-b border-[var(--border-te)]/50">
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-text-primary/10 text-text-primary uppercase tracking-wider">
          Mixer
        </span>
        <button
          onClick={store.toggleLimiter}
          className={`px-2 py-1 text-[8px] font-mono uppercase font-bold rounded border cursor-pointer active:scale-95 transition-transform duration-75 ${
            store.limiterActive
              ? 'bg-accent/15 border-accent text-accent'
              : 'bg-surface border-[var(--border-te)] text-text-secondary hover:text-text-primary'
          }`}
        >
          Limiter: {store.limiterActive ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* EQ Columns for Deck A (left) and Deck B (right) */}
      <div className="flex justify-between w-full flex-1 py-4 gap-4">
        {/* Deck A EQ Column */}
        <div className="flex flex-col justify-between items-center flex-1">
          <Knob
            value={store.deckA.eqHigh}
            min={0.0}
            max={2.0}
            defaultValue={1.0}
            onChange={(val) => store.setEQ('A', 'high', val)}
            label="HI"
          />
          <Knob
            value={store.deckA.eqMid}
            min={0.0}
            max={2.0}
            defaultValue={1.0}
            onChange={(val) => store.setEQ('A', 'mid', val)}
            label="MID"
          />
          <Knob
            value={store.deckA.eqLow}
            min={0.0}
            max={2.0}
            defaultValue={1.0}
            onChange={(val) => store.setEQ('A', 'low', val)}
            label="LOW"
          />
        </div>

        {/* Center Section: Master Volume and Filter */}
        <div className="flex flex-col justify-between items-center w-16">
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase tracking-wider text-text-secondary/70 font-sans mb-1 font-bold">
              Filter A
            </span>
            <Knob
              value={store.deckA.filter}
              min={-1.0}
              max={1.0}
              defaultValue={0.0}
              onChange={(val) => store.setFilter('A', val)}
              label="HP/LP"
            />
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-[8px] uppercase tracking-wider text-text-secondary/70 font-sans mb-1 font-bold">
              Filter B
            </span>
            <Knob
              value={store.deckB.filter}
              min={-1.0}
              max={1.0}
              defaultValue={0.0}
              onChange={(val) => store.setFilter('B', val)}
              label="HP/LP"
            />
          </div>

          <div className="flex flex-col items-center mt-2">
            <span className="text-[9px] uppercase tracking-wider text-text-secondary font-sans mb-1 font-bold">
              Master
            </span>
            <div className="h-16 w-1.5 bg-background border border-[var(--border-te)] rounded-full relative flex items-center justify-center cursor-pointer">
              <div
                className="absolute w-4 h-2 bg-text-primary rounded-xs cursor-ns-resize shadow-md"
                style={{
                  bottom: `${store.masterVolume * 100}%`,
                  transform: 'translateY(50%)',
                }}
                onMouseDown={(e) => {
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const rect = e.currentTarget.parentElement?.getBoundingClientRect()
                    if (!rect) return
                    const relativeY = rect.bottom - moveEvent.clientY
                    const percent = Math.min(1, Math.max(0, relativeY / rect.height))
                    store.setMasterVolume(percent)
                  }
                  const handleMouseUp = () => {
                    window.removeEventListener('mousemove', handleMouseMove)
                    window.removeEventListener('mouseup', handleMouseUp)
                  }
                  window.addEventListener('mousemove', handleMouseMove)
                  window.addEventListener('mouseup', handleMouseUp)
                }}
              />
            </div>
            <span className="text-[9px] font-mono font-bold mt-1">{(store.masterVolume * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Deck B EQ Column */}
        <div className="flex flex-col justify-between items-center flex-1">
          <Knob
            value={store.deckB.eqHigh}
            min={0.0}
            max={2.0}
            defaultValue={1.0}
            onChange={(val) => store.setEQ('B', 'high', val)}
            label="HI"
          />
          <Knob
            value={store.deckB.eqMid}
            min={0.0}
            max={2.0}
            defaultValue={1.0}
            onChange={(val) => store.setEQ('B', 'mid', val)}
            label="MID"
          />
          <Knob
            value={store.deckB.eqLow}
            min={0.0}
            max={2.0}
            defaultValue={1.0}
            onChange={(val) => store.setEQ('B', 'low', val)}
            label="LOW"
          />
        </div>
      </div>

      {/* Bottom Crossfader control */}
      <div className="w-full pt-4 border-t border-[var(--border-te)]/50 flex justify-center">
        <Crossfader value={store.crossfader} onChange={store.setCrossfader} />
      </div>
    </div>
  )
}
