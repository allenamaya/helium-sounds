import { create } from 'zustand'

export interface Track {
  id: string
  title: string
  artist: string
  bpm: number
  duration: number
  key: string
  filePath: string
  label: string
}

export interface DeckState {
  isPlaying: boolean
  filePath: string | null
  title: string | null
  artist: string | null
  bpm: number
  originalBpm: number
  pitch: number // multiplier, e.g. 1.0 = normal, 1.08 = +8%
  volume: number
  currentTime: number
  duration: number
  loopActive: boolean
  loopLength: number // beats, e.g. 4
  keyLock: boolean
  eqHigh: number // 0.0 to 2.0
  eqMid: number // 0.0 to 2.0
  eqLow: number // 0.0 to 2.0
  filter: number // -1.0 (lowpass) to 1.0 (highpass), 0.0 is flat
}

interface DJStore {
  deckA: DeckState
  deckB: DeckState
  crossfader: number // -1.0 (Deck A only) to 1.0 (Deck B only)
  masterVolume: number
  limiterActive: boolean
  libraryTracks: Track[]
  
  // Actions
  togglePlay: (deck: 'A' | 'B') => void
  setFilePath: (deck: 'A' | 'B', path: string, title: string, artist: string, bpm: number, duration: number) => void
  setPitch: (deck: 'A' | 'B', pitch: number) => void
  setVolume: (deck: 'A' | 'B', volume: number) => void
  setCurrentTime: (deck: 'A' | 'B', time: number) => void
  setLoop: (deck: 'A' | 'B', active: boolean, length?: number) => void
  setKeyLock: (deck: 'A' | 'B', enabled: boolean) => void
  setEQ: (deck: 'A' | 'B', band: 'high' | 'mid' | 'low', value: number) => void
  setFilter: (deck: 'A' | 'B', value: number) => void
  
  // Mixer actions
  setCrossfader: (value: number) => void
  setMasterVolume: (value: number) => void
  toggleLimiter: () => void

  // Library actions
  addLocalTracks: (tracks: Omit<Track, 'id'>[]) => void
  removeTrack: (id: string) => void
  clearLibrary: () => void
}

const initialDeckState = (title: string, artist: string, bpm: number): DeckState => ({
  isPlaying: false,
  filePath: null,
  title,
  artist,
  bpm,
  originalBpm: bpm,
  pitch: 1.0,
  volume: 1.0,
  currentTime: 0.0,
  duration: 0.0,
  loopActive: false,
  loopLength: 4,
  keyLock: false,
  eqHigh: 1.0,
  eqMid: 1.0,
  eqLow: 1.0,
  filter: 0.0,
})

export const useDJStore = create<DJStore>((set) => ({
  deckA: initialDeckState('Deck A Track', 'Teenage Art', 120),
  deckB: initialDeckState('Deck B Track', 'Minimal Beats', 125),
  crossfader: 0.0,
  masterVolume: 0.8,
  limiterActive: true,
  libraryTracks: [], // Starts empty, local-only loading!

  togglePlay: (deck) =>
    set((state) => {
      const targetDeck = deck === 'A' ? 'deckA' : 'deckB'
      return {
        [targetDeck]: {
          ...state[targetDeck],
          isPlaying: !state[targetDeck].isPlaying,
        },
      }
    }),

  setFilePath: (deck, path, title, artist, bpm, duration) =>
    set((state) => {
      const targetDeck = deck === 'A' ? 'deckA' : 'deckB'
      return {
        [targetDeck]: {
          ...state[targetDeck],
          filePath: path,
          title,
          artist,
          bpm,
          originalBpm: bpm,
          duration,
          currentTime: 0.0,
        },
      }
    }),

  setPitch: (deck, pitch) =>
    set((state) => {
      const targetDeck = deck === 'A' ? 'deckA' : 'deckB'
      return {
        [targetDeck]: {
          ...state[targetDeck],
          pitch,
          bpm: state[targetDeck].originalBpm * pitch,
        },
      }
    }),

  setVolume: (deck, volume) =>
    set((state) => {
      const targetDeck = deck === 'A' ? 'deckA' : 'deckB'
      return {
        [targetDeck]: {
          ...state[targetDeck],
          volume,
        },
      }
    }),

  setCurrentTime: (deck, time) =>
    set((state) => {
      const targetDeck = deck === 'A' ? 'deckA' : 'deckB'
      return {
        [targetDeck]: {
          ...state[targetDeck],
          currentTime: Math.min(Math.max(0, time), state[targetDeck].duration || 180),
        },
      }
    }),

  setLoop: (deck, active, length) =>
    set((state) => {
      const targetDeck = deck === 'A' ? 'deckA' : 'deckB'
      return {
        [targetDeck]: {
          ...state[targetDeck],
          loopActive: active,
          loopLength: length !== undefined ? length : state[targetDeck].loopLength,
        },
      }
    }),

  setKeyLock: (deck, enabled) =>
    set((state) => {
      const targetDeck = deck === 'A' ? 'deckA' : 'deckB'
      return {
        [targetDeck]: {
          ...state[targetDeck],
          keyLock: enabled,
        },
      }
    }),

  setEQ: (deck, band, value) =>
    set((state) => {
      const targetDeck = deck === 'A' ? 'deckA' : 'deckB'
      const eqField = band === 'high' ? 'eqHigh' : band === 'mid' ? 'eqMid' : 'eqLow'
      return {
        [targetDeck]: {
          ...state[targetDeck],
          [eqField]: value,
        },
      }
    }),

  setFilter: (deck, value) =>
    set((state) => {
      const targetDeck = deck === 'A' ? 'deckA' : 'deckB'
      return {
        [targetDeck]: {
          ...state[targetDeck],
          filter: value,
        },
      }
    }),

  setCrossfader: (value) => set({ crossfader: value }),
  setMasterVolume: (value) => set({ masterVolume: value }),
  toggleLimiter: () => set((state) => ({ limiterActive: !state.limiterActive })),

  addLocalTracks: (tracks) =>
    set((state) => {
      const newTracks = tracks.map((t, index) => ({
        ...t,
        id: `${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      }))
      return {
        libraryTracks: [...state.libraryTracks, ...newTracks],
      }
    }),

  removeTrack: (id) =>
    set((state) => ({
      libraryTracks: state.libraryTracks.filter((t) => t.id !== id),
    })),

  clearLibrary: () => set({ libraryTracks: [] }),
}))
