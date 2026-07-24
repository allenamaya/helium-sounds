import React, { useEffect, useRef, useState } from 'react'

interface PlatterProps {
  isPlaying: boolean
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  color: string
}

export const Platter: React.FC<PlatterProps> = ({
  isPlaying,
  currentTime,
  duration,
  onSeek,
  color,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const isDragging = useRef(false)
  const lastAngle = useRef(0)
  const animationFrameId = useRef<number | null>(null)

  // Track rotation when playing
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
      return
    }

    const updateRotation = () => {
      setRotation((prev) => (prev + 1.2) % 360) // Speed matches BPM/tempo roughly
      animationFrameId.current = requestAnimationFrame(updateRotation)
    }

    animationFrameId.current = requestAnimationFrame(updateRotation)

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isPlaying])

  // Canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 150
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const center = size / 2
    const radius = size / 2 - 10

    // Clear
    ctx.clearRect(0, 0, size, size)

    // Outer metal ring
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#111111'
    ctx.fill()
    ctx.lineWidth = 1.5
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'
    ctx.stroke()

    // Tactile vinyl grooves
    for (let r = radius - 8; r > 15; r -= 6) {
      ctx.beginPath()
      ctx.arc(center, center, r, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // Colored center hub label (Teenage Engineering accent colored)
    ctx.beginPath()
    ctx.arc(center, center, 22, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()

    // Inner spindle hole
    ctx.beginPath()
    ctx.arc(center, center, 3, 0, Math.PI * 2)
    ctx.fillStyle = '#F7F7F5'
    ctx.fill()

    // Rotation indicator line (spins when playing or seeking)
    const rad = (rotation * Math.PI) / 180
    ctx.beginPath()
    ctx.moveTo(center + Math.cos(rad) * 12, center + Math.sin(rad) * 12)
    ctx.lineTo(center + Math.cos(rad) * radius, center + Math.sin(rad) * radius)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw active playhead arc indicator (shows track time percentage)
    if (duration > 0) {
      const percentage = currentTime / duration
      ctx.beginPath()
      ctx.arc(center, center, radius + 4, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * percentage)
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }, [rotation, currentTime, duration, color])

  // Mouse interaction for seeking/scratching
  const getAngle = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return 0
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left - rect.width / 2
    const y = clientY - rect.top - rect.height / 2
    return Math.atan2(y, x)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    lastAngle.current = getAngle(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || duration <= 0) return
    const currentAngle = getAngle(e.clientX, e.clientY)
    let delta = currentAngle - lastAngle.current

    // Handle wrap-around
    if (delta > Math.PI) delta -= Math.PI * 2
    if (delta < -Math.PI) delta += Math.PI * 2

    // Map rotation delta to time seek (1 rotation = 10 seconds of seek)
    const seekDelta = (delta / (Math.PI * 2)) * 10
    const newTime = Math.min(duration, Math.max(0, currentTime + seekDelta))
    onSeek(newTime)

    // Adjust rotation visual state
    setRotation((prev) => (prev + (delta * 180) / Math.PI) % 360)
    lastAngle.current = currentAngle
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-3 select-none">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="cursor-grab active:cursor-grabbing hover:scale-[1.01] transition-transform duration-200"
      />
      {/* Time overlay indicator */}
      <div className="absolute text-[9px] font-mono text-white pointer-events-none mt-14 bg-black/60 px-1 py-0.5 rounded backdrop-blur-xs">
        {Math.floor(currentTime / 60)}:
        {Math.floor(currentTime % 60)
          .toString()
          .padStart(2, '0')}
      </div>
    </div>
  )
}
