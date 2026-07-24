import React, { useState, useRef } from 'react'
import { useDJStore } from '../store/useDJStore'
import type { Track } from '../store/useDJStore'

export const Library: React.FC = () => {
  const [search, setSearch] = useState('')
  const { libraryTracks, addLocalTracks, removeTrack, clearLibrary, setFilePath } = useDJStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Detect if we are running inside Tauri desktop environment
  const isTauriEnv = typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

  const handleImportFilesClick = async () => {
    if (isTauriEnv) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog')
        const selected = await open({
          multiple: true,
          filters: [{ name: 'Audio Files', extensions: ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac'] }],
        })

        if (selected && Array.isArray(selected)) {
          const newTracks = selected.map((filePath) => {
            // Extract filename from path
            const filename = filePath.split(/[/\\]/).pop() || 'Unknown Track'
            const title = filename.replace(/\.[^/.]+$/, '') // strip extension
            const randomBpm = Math.floor(Math.random() * (130 - 110 + 1)) + 110
            return {
              title,
              artist: 'Local File',
              bpm: randomBpm,
              duration: 210, // Mock duration of 3:30
              key: '8A',
              filePath,
              label: 'Local',
            }
          })
          addLocalTracks(newTracks)
        }
      } catch (err) {
        console.error('Tauri Dialog open failed:', err)
      }
    } else {
      // Browser fallback - trigger file input click
      fileInputRef.current?.click()
    }
  }

  const handleFolderScanClick = async () => {
    if (isTauriEnv) {
      try {
        const { open } = await import('@tauri-apps/plugin-dialog')
        const selected = await open({
          directory: true,
          multiple: false,
        })

        if (selected && typeof selected === 'string') {
          const { readDir } = await import('@tauri-apps/plugin-fs')
          const entries = await readDir(selected)
          
          const audioExtensions = ['mp3', 'wav', 'flac', 'ogg', 'm4a', 'aac']
          const audioFiles = entries.filter(
            (entry) =>
              entry.isFile &&
              audioExtensions.some((ext) => entry.name.toLowerCase().endsWith(`.${ext}`)),
          )

          const newTracks = audioFiles.map((file) => {
            const separator = selected.includes('\\') ? '\\' : '/'
            const filePath = `${selected}${separator}${file.name}`
            const title = file.name.replace(/\.[^/.]+$/, '')
            const randomBpm = Math.floor(Math.random() * (130 - 110 + 1)) + 110
            return {
              title,
              artist: 'Local Folder',
              bpm: randomBpm,
              duration: 180,
              key: '5A',
              filePath,
              label: 'Local',
            }
          })

          addLocalTracks(newTracks)
        }
      } catch (err) {
        console.error('Tauri Directory scan failed:', err)
      }
    } else {
      // Browser fallback - trigger folder upload click
      folderInputRef.current?.click()
    }
  }

  // HTML5 Browser Fallback handlers
  const handleBrowserFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newTracks = Array.from(files).map((file) => {
      const title = file.name.replace(/\.[^/.]+$/, '')
      const randomBpm = Math.floor(Math.random() * (130 - 110 + 1)) + 110
      // In browser, create a local blob URL so we can actually play it!
      const filePath = URL.createObjectURL(file)
      return {
        title,
        artist: 'Web Upload',
        bpm: randomBpm,
        duration: 180,
        key: '9A',
        filePath,
        label: 'Local',
      }
    })

    addLocalTracks(newTracks)
    e.target.value = '' // reset input
  }

  const handleLoadTrack = (deck: 'A' | 'B', track: Track) => {
    setFilePath(deck, track.filePath, track.title, track.artist, track.bpm, track.duration)
  }

  const filteredTracks = libraryTracks.filter(
    (t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.artist.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="matte-surface p-6 flex flex-col h-[280px] w-full select-none">
      {/* Hidden browser fallback inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBrowserFileInput}
        multiple
        accept="audio/*"
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleBrowserFileInput}
        className="hidden"
        style={{ display: 'none' }}
        {...{
          webkitdirectory: '',
          directory: '',
        } as Record<string, string>}
      />



      {/* Library Header and controls */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-te)]/50">
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-text-primary/10 text-text-primary uppercase tracking-wider">
            Library
          </span>
          <span className="text-[11px] font-sans text-text-secondary/70 font-semibold">
            {libraryTracks.length} local track(s) loaded
          </span>
        </div>

        {/* Tactile Hardware-style Import Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleImportFilesClick}
            className="px-3 py-1.5 rounded border border-[var(--border-te)] bg-surface text-[10px] uppercase font-mono font-bold cursor-pointer hover:bg-background/40 active:scale-95 transition-transform"
          >
            Import Tracks
          </button>
          <button
            onClick={handleFolderScanClick}
            className="px-3 py-1.5 rounded border border-[var(--border-te)] bg-surface text-[10px] uppercase font-mono font-bold cursor-pointer hover:bg-background/40 active:scale-95 transition-transform"
          >
            Scan Folder
          </button>
          <button
            onClick={clearLibrary}
            className="px-3 py-1.5 rounded border border-danger/25 bg-surface text-danger text-[10px] uppercase font-mono font-bold cursor-pointer hover:bg-danger/5 active:scale-95 transition-transform"
          >
            Clear
          </button>

          {/* Minimal Search Input */}
          <input
            type="text"
            placeholder="SEARCH..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-[var(--border-te)] px-3 py-1.5 rounded text-xs font-mono w-48 bg-surface text-text-primary focus:outline-hidden focus:ring-1 focus:ring-accent ml-2"
          />
        </div>
      </div>

      {/* Tracks List Scrollable Container */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredTracks.length === 0 ? (
          <div className="h-full flex flex-col justify-center items-center text-text-secondary/50 font-mono text-xs">
            <span>NO LOCAL TRACKS LOADED</span>
            <span className="text-[9px] mt-1 text-text-secondary/35">
              CLICK IMPORT TRACKS OR SCAN FOLDER TO BEGIN
            </span>
          </div>
        ) : (
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-[var(--border-te)]/30 text-[10px] text-text-secondary uppercase font-semibold tracking-wider">
                <th className="py-2 pl-2">Title</th>
                <th className="py-2">Source</th>
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
                  <td className="py-2.5 font-bold text-text-primary pl-2 flex items-center gap-2 max-w-[280px] truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    {track.title}
                  </td>
                  <td className="py-2.5 text-text-secondary font-medium max-w-[200px] truncate">
                    {track.artist}
                  </td>
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
                    <button
                      onClick={() => removeTrack(track.id)}
                      className="px-1.5 py-1 text-[9px] font-mono text-danger/70 hover:text-danger hover:bg-danger/5 rounded cursor-pointer active:scale-95 transition-transform"
                    >
                      DEL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
