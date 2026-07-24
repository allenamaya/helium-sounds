import { describe, it, expect, beforeEach } from 'vitest'
import { useDJStore } from '../store/useDJStore'

describe('DJ Zustand Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useDJStore.getState()
    if (store.deckA.isPlaying) store.togglePlay('A')
    if (store.deckB.isPlaying) store.togglePlay('B')
    store.setCrossfader(0.0)
    store.setMasterVolume(0.8)
    store.clearLibrary()
  })

  it('should initialize with correct default values', () => {
    const state = useDJStore.getState()
    expect(state.deckA.isPlaying).toBe(false)
    expect(state.deckB.isPlaying).toBe(false)
    expect(state.crossfader).toBe(0.0)
    expect(state.masterVolume).toBe(0.8)
    expect(state.limiterActive).toBe(true)
    expect(state.libraryTracks).toEqual([])
  })

  it('should toggle playback state for decks', () => {
    const store = useDJStore.getState()
    expect(store.deckA.isPlaying).toBe(false)
    
    // Toggle play
    useDJStore.getState().togglePlay('A')
    expect(useDJStore.getState().deckA.isPlaying).toBe(true)

    // Toggle pause
    useDJStore.getState().togglePlay('A')
    expect(useDJStore.getState().deckA.isPlaying).toBe(false)
  })

  it('should update pitch and scale BPM accordingly', () => {
    const store = useDJStore.getState()
    const originalBpm = store.deckA.originalBpm

    // Shift pitch +5%
    useDJStore.getState().setPitch('A', 1.05)
    expect(useDJStore.getState().deckA.pitch).toBe(1.05)
    expect(useDJStore.getState().deckA.bpm).toBe(originalBpm * 1.05)
  })

  it('should adjust mixer crossfader values', () => {
    useDJStore.getState().setCrossfader(0.5)
    expect(useDJStore.getState().crossfader).toBe(0.5)

    useDJStore.getState().setCrossfader(-1.0)
    expect(useDJStore.getState().crossfader).toBe(-1.0)
  })

  it('should support adding, removing, and clearing local tracks in the library', () => {
    const store = useDJStore.getState()
    expect(store.libraryTracks.length).toBe(0)

    // Add track
    store.addLocalTracks([
      {
        title: 'My Custom Song',
        artist: 'Producer Bob',
        bpm: 128,
        duration: 200,
        key: '4A',
        filePath: '/some/local/path.mp3',
        label: 'Local',
      }
    ])

    let updatedState = useDJStore.getState()
    expect(updatedState.libraryTracks.length).toBe(1)
    expect(updatedState.libraryTracks[0].title).toBe('My Custom Song')

    const trackId = updatedState.libraryTracks[0].id

    // Remove track
    store.removeTrack(trackId)
    updatedState = useDJStore.getState()
    expect(updatedState.libraryTracks.length).toBe(0)
  })
})

