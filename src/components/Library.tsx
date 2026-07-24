import React, { useState } from 'react'
import { useDJStore } from '../store/useDJStore'

interface Track {
  id: string
  title: string
  artist: string
  bpm: number
  duration: number
  key: string
  label: string
}

const mockTracks: Track[] = [
  { id: '1', title: 'Teenage Art', artist: 'Teenage Engineering', bpm: 120, duration: 210, key: '5A', label: 'Yellow' },
  { id: '2', title: 'Minimal Beats', artist: 'Ableton Live', bpm: 125, duration: 180, key: '8A', label: 'Blue' },
  { id: '3', title: 'Acid Acid', artist: 'Roland 303', bpm: 130, duration: 240, key: '2A', label: 'Red' },
  { id: '4', title: 'Pocket Operator', artist: 'PO-33 KO', bpm: 115, duration: 150, key: '11B', label: 'Green' },
  { id: '5', title: 'OP-1 FM', artist: 'TE Labs', bpm: 118, duration: 200, key: '4A', label: 'Yellow' },
  { id: '6', title: 'OB-4 Ambient', artist: 'Field System', bpm: 95, duration: 300, key: '1B', label: 'Orange' },
]

export const Library: React.FC = () => {
  const [search, setSearch] = useState('')
  const setFilePath = useDJStore((state) => state.setFilePath)

  const filteredTracks = mockTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase()),
  )

  const handleLoadTrack = (deck: 'A' | 'B', track: Track) => {
    setFilePath(
      deck,
      `/music/${track.title.toLowerCase().replace(/\s+/g, '-')}.mp3`,
      track.title,
      track.artist,
      track.bpm,
      track.duration,
    )
  }

  return (
    <div className="matte-surface p-6 flex flex-col h-[280px] w-full select-none">
      {/* Library Header and Search bar */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-te)]/50">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-text-primary/10 text-text-primary uppercase tracking-wider">
            Library
          </span>
          <span className="text-[11px] font-sans text-text-secondary/70 font-semibold">
            {mockTracks.length} tracks indexed
          </span>
        </div>
        
        {/* Minimal Search Input */}
        <input
          type="text"
          placeholder="SEARCH TRACK..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[var(--border-te)] px-3 py-1.5 rounded text-xs font-mono w-64 bg-surface text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Tracks List Scrollable Container */}
      <div className="flex-1 overflow-y-auto pr-1">
        <table className="w-full text-left text-xs font-sans">
          <thead>
            <tr className="border-b border-[var(--border-te)]/30 text-[10px] text-text-secondary uppercase font-semibold tracking-wider">
              <th className="py-2 pl-2">Title</th>
              <th className="py-2">Artist</th>
              <th className="py-2">BPM</th>
              <th className="py-2">Key</th>
              <th className="py-2 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTracks.map((track) => (
              <tr
                key={track.id}
                className="border-b border-[var(--border-te)]/20 hover:bg-background/40 transition-colors"
              >
                <td className="py-2.5 font-bold text-text-primary pl-2 flex items-center gap-2">
                  {/* Small Teenage Engineering label indicator */}
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor:
                        track.label === 'Yellow'
                          ? 'var(--accent)'
                          : track.label === 'Blue'
                            ? 'var(--accent-secondary)'
                            : track.label === 'Red'
                              ? 'var(--danger)'
                              : track.label === 'Green'
                                ? 'var(--success)'
                                : '#FFA500',
                    }}
                  />
                  {track.title}
                </td>
                <td className="py-2.5 text-text-secondary font-medium">{track.artist}</td>
                <td className="py-2.5 font-mono font-semibold text-text-primary">{track.bpm}</td>
                <td className="py-2.5 font-mono text-text-secondary">{track.key}</td>
                <td className="py-2.5 text-right pr-4 flex justify-end gap-1.5">
                  <button
                    onClick={() => handleLoadTrack('A', track)}
                    className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase rounded border border-[var(--border-te)] bg-surface text-text-primary hover:bg-background cursor-pointer active:scale-95 transition-transform"
                  >
                    Load A
                  </button>
                  <button
                    onClick={() => handleLoadTrack('B', track)}
                    className="px-2.5 py-1 text-[9px] font-sans font-bold uppercase rounded border border-[var(--border-te)] bg-surface text-text-primary hover:bg-background cursor-pointer active:scale-95 transition-transform"
                  >
                    Load B
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
