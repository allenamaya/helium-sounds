// Mock browser APIs not present in JSDOM
import { vi } from 'vitest'

// Mock AudioContext
class MockAudioContext {
  createGain() {
    return {
      gain: { value: 1.0, setValueAtTime: () => {} },
      connect: () => {},
    }
  }
  createBiquadFilter() {
    return {
      frequency: { value: 1000, setValueAtTime: () => {} },
      Q: { value: 1.0 },
      connect: () => {},
    }
  }
  connect() {}
  destination = {}
}

vi.stubGlobal('AudioContext', MockAudioContext)
vi.stubGlobal('webkitAudioContext', MockAudioContext)

// Mock Canvas getContext
HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation(() => {
  return {
    fillRect: () => {},
    clearRect: () => {},
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    stroke: () => {},
    fill: () => {},
    createLinearGradient: () => ({
      addColorStop: () => {},
    }),
  }
})
