import React, { useEffect } from 'react'
import { useDJStore } from '../store/useDJStore'
import { Platter } from './Platter'

import { Fader } from './Fader'
import { invoke } from '@tauri-apps/api/core'

interface DeckProps {
  id: 'A' | 'B'
  color: string
}

export const Deck: React.FC<DeckProps> = ({ id, color }) => {
  const deck = useDJStore((state) => (id === 'A' ? state.deckA : state.deckB))
  const togglePlay = useDJStore((state) => state.togglePlay)
  const setPitch = useDJStore((state) => state.setPitch)
  const setCurrentTime = useDJStore((state) => state.setCurrentTime)
  const setKeyLock = useDJStore((state) => state.setKeyLock)
  const setLoop = useDJStore((state) => state.setLoop)
  const setVolume = useDJStore((state) => state.setVolume)

  // Trigger backend Tauri commands when playing toggles
  useEffect(() => {
    // Invoke command via Tauri core API
    invoke('toggle_playback').catch((err) => {
      // Fail silently if not running inside Tauri (web environment fallback)
      console.log('Tauri toggle_playback invoke failed (normal in web):', err)
    })
  }, [deck.isPlaying])

  // Mock incrementing current playback time when playing
  useEffect(() => {
    if (!deck.isPlaying) return

    const interval = setInterval(() => {
      if (deck.duration > 0) {
        if (deck.currentTime >= deck.duration) {
          if (deck.loopActive) {
            // Loop back to start (or loop length section)
            setCurrentTime(id, 0)
          } else {
            togglePlay(id)
            setCurrentTime(id, 0)
          }
        } else {
          setCurrentTime(id, deck.currentTime + 0.1)
        }
      } else {
        // Mock default track duration of 180s in web fallback
        if (deck.currentTime >= 180) {
          setCurrentTime(id, 0)
        } else {
          setCurrentTime(id, deck.currentTime + 0.1)
        }
      }
    }, 100)

    return () => clearInterval(interval)
  }, [deck.isPlaying, deck.currentTime, deck.duration, deck.loopActive, id, setCurrentTime, togglePlay])

  const handleSeek = (newTime: number) => {
    setCurrentTime(id, newTime)
  }

  // Format pitch value as percentage, e.g. +4.5%
  const pitchPercent = ((deck.pitch - 1.0) * 100).toFixed(1)

  return (
    <div className="matte-surface p-6 flex flex-col justify-between w-full h-[460px] relative select-none">
      {/* Top Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-text-primary/10 text-text-primary uppercase tracking-wider">
            Deck {id}
          </span>
          <h2 className="text-sm font-sans font-bold text-text-primary mt-2 max-w-[160px] truncate">
            {deck.title || 'No Track Loaded'}
          </h2>
          <p className="text-[10px] font-sans text-text-secondary font-medium truncate max-w-[160px]">
            {deck.artist || 'Teenage Engineering'}
          </p>
        </div>

        {/* Big Retro BPM Counter */}
        <div className="text-right">
          <div className="text-2xl font-mono font-bold tracking-tight text-text-primary">
            {deck.bpm.toFixed(1)}
          </div>
          <div className="text-[9px] uppercase font-sans text-text-secondary/70 font-semibold tracking-wider">
            BPM ({pitchPercent >= '0.0' ? `+${pitchPercent}` : pitchPercent}%)
          </div>
        </div>
      </div>

      {/* Middle Interactive Deck Platter & Faders */}
      <div className="flex items-center justify-between my-4 gap-4">
        {/* Left Side: Platter */}
        <div className="flex-1 flex justify-center">
          <Platter
            isPlaying={deck.isPlaying}
            currentTime={deck.currentTime}
            duration={deck.duration || 180.0} // Fallback to 3m
            onSeek={handleSeek}
            color={color}
          />
        </div>

        {/* Right Side: Pitch & Volume Faders */}
        <div className="flex gap-4">
          <Fader
            value={deck.volume}
            min={0.0}
            max={1.0}
            onChange={(val) => setVolume(id, val)}
            label="VOL"
            height={130}
          />
          <Fader
            value={deck.pitch}
            min={0.92} // -8%
            max={1.08} // +8%
            onChange={(val) => {
              setPitch(id, val)
              // Update tempo in Tauri backend
              invoke('set_tempo', { tempo: deck.originalBpm * val }).catch((_e) => {})
            }}
            label="PITCH"
            height={130}
            unit="x"
          />
        </div>
      </div>

      {/* Bottom Hardware Control Panel */}
      <div className="flex justify-between items-center pt-4 border-t border-[var(--border-te)]/50">
        {/* Play/Pause/Sync Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => togglePlay(id)}
            className={`px-4 py-2 text-[11px] font-sans uppercase font-bold tracking-wider rounded border cursor-pointer active:scale-95 transition-transform duration-75 ${
              deck.isPlaying
                ? 'bg-text-primary text-background border-text-primary'
                : 'bg-surface text-text-primary border-[var(--border-te)] hover:bg-background/40'
            }`}
          >
            {deck.isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={() => {
              // Sync to other deck (mock implementation for phase 1)
              const otherBpm = useDJStore.getState()[id === 'A' ? 'deckB' : 'deckA'].bpm
              const scale = otherBpm / deck.originalBpm
              setPitch(id, scale)
            }}
            className="px-3 py-2 text-[10px] font-sans uppercase font-bold tracking-wider rounded border border-[var(--border-te)] bg-surface text-text-primary hover:bg-background/40 active:scale-95 cursor-pointer"
          >
            Sync
          </button>
        </div>

        {/* Loop controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLoop(id, !deck.loopActive)}
            className={`px-2.5 py-1.5 text-[9px] font-mono uppercase font-bold rounded border cursor-pointer ${
              deck.loopActive
                ? 'bg-accent/15 border-accent text-accent'
                : 'bg-surface border-[var(--border-te)] text-text-secondary hover:text-text-primary'
            }`}
          >
            Loop {deck.loopLength}B
          </button>
          <button
            onClick={() => setLoop(id, deck.loopActive, deck.loopLength === 4 ? 8 : deck.loopLength === 8 ? 16 : 4)}
            className="px-2 py-1 text-[9px] font-mono rounded border border-[var(--border-te)] text-text-secondary hover:text-text-primary cursor-pointer active:scale-95"
          >
            /2
          </button>
        </div>

        {/* Key Lock Control */}
        <button
          onClick={() => setKeyLock(id, !deck.keyLock)}
          className={`px-2.5 py-1.5 text-[9px] font-sans uppercase font-bold rounded border cursor-pointer ${
            deck.keyLock
              ? 'bg-accent-secondary/15 border-accent-secondary text-accent-secondary'
              : 'bg-surface border-[var(--border-te)] text-text-secondary hover:text-text-primary'
          }`}
        >
          Key Lock
        </button>
      </div>
    </div>
  )
}
