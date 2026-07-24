import React, { useRef, useState, useEffect, useCallback } from 'react'

interface FaderProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  label: string
  height?: number
  unit?: string
}

export const Fader: React.FC<FaderProps> = ({
  value,
  min,
  max,
  onChange,
  label,
  height = 160,
  unit = '',
}) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleUpdate = useCallback((clientY: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const relativeY = rect.bottom - clientY // calculate from bottom up
    const percent = Math.min(1, Math.max(0, relativeY / rect.height))
    const newValue = min + percent * (max - min)
    onChange(newValue)
  }, [min, max, onChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleUpdate(e.clientY)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      handleUpdate(e.clientY)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, handleUpdate])

  // Percentage from bottom (0% to 100%)
  const percentage = ((value - min) / (max - min)) * 100

  // Tick marks
  const tickCount = 6
  const ticks = Array.from({ length: tickCount })

  return (
    <div className="flex flex-col items-center select-none">
      <span className="text-[9px] uppercase tracking-wider text-text-secondary font-sans mb-3 font-semibold">
        {label}
      </span>
      <div className="flex items-center">
        {/* Tick marks on left side */}
        <div
          className="flex flex-col justify-between pr-2 text-[8px] font-mono text-text-secondary/40 font-bold"
          style={{ height: `${height}px` }}
        >
          {ticks.map((_, i) => (
            <span key={i}>{(max - (i / (tickCount - 1)) * (max - min)).toFixed(0)}</span>
          ))}
        </div>

        {/* Fader Track */}
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          className="w-4 bg-background border border-[var(--border-te)] rounded-full relative cursor-pointer shadow-inner flex justify-center"
          style={{ height: `${height}px` }}
        >
          {/* Active filled track */}
          <div
            className="absolute bottom-0 w-full bg-accent/15 rounded-b-full border-t border-accent/25"
            style={{ height: `${percentage}%` }}
          />

          {/* Sliding Fader handle */}
          <div
            className="absolute left-1/2 w-8 h-4 -ml-4 bg-surface border border-text-primary/10 rounded shadow-md cursor-grab active:cursor-grabbing hover:scale-[1.03] active:scale-[0.98] transition-transform duration-75 flex flex-col justify-center items-center"
            style={{
              bottom: `calc(${percentage}% - 8px)`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1), var(--shadow-ui)',
            }}
          >
            {/* Tactile ridge indicator */}
            <div className="w-6 h-0.5 bg-text-primary/80 rounded-full" />
          </div>
        </div>
      </div>
      <span className="text-[10px] font-mono text-text-primary mt-3 font-bold">
        {value.toFixed(1)}
        <span className="text-[8px] text-text-secondary/50 ml-0.5">{unit}</span>
      </span>
    </div>
  )
}
