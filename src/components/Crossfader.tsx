import React, { useRef, useState, useEffect, useCallback } from 'react'

interface CrossfaderProps {
  value: number
  onChange: (value: number) => void
}

export const Crossfader: React.FC<CrossfaderProps> = ({ value, onChange }) => {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleUpdate = useCallback((clientX: number) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const relativeX = clientX - rect.left
    const percent = Math.min(1, Math.max(0, relativeX / rect.width))
    // Map 0-1 to -1.0 to 1.0
    const newValue = percent * 2 - 1.0
    onChange(newValue)
  }, [onChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleUpdate(e.clientX)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      handleUpdate(e.clientX)
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


  // Percent position for the fader thumb (from 0% to 100%)
  const percentage = ((value + 1.0) / 2.0) * 100

  return (
    <div className="flex flex-col items-center w-full select-none">
      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-sans mb-3 font-medium">
        Crossfader
      </span>
      <div className="relative w-72 h-10 flex items-center justify-center">
        {/* Track border/background */}
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          className="w-full h-3 bg-background border border-[var(--border-te)] rounded-full cursor-pointer relative shadow-inner"
        >
          {/* Center alignment tick */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-text-secondary/30 -translate-x-1/2" />
          
          {/* Horizontal side indicators */}
          <div className="absolute left-1/4 top-1/2 w-1.5 h-1.5 bg-text-secondary/15 rounded-full -translate-y-1/2" />
          <div className="absolute right-1/4 top-1/2 w-1.5 h-1.5 bg-text-secondary/15 rounded-full -translate-y-1/2" />

          {/* Sliding Fader handle */}
          <div
            className="absolute top-1/2 w-8 h-8 -ml-4 bg-surface border border-text-primary/10 rounded-md shadow-md cursor-grab active:cursor-grabbing hover:scale-[1.03] active:scale-[0.98] transition-transform duration-75 flex items-center justify-center"
            style={{
              left: `${percentage}%`,
              transform: 'translateY(-50%)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1), var(--shadow-ui)',
            }}
          >
            {/* Physical metal ridge details */}
            <div className="w-1 h-5 bg-text-secondary/40 rounded-full mx-0.5" />
            <div className="w-1 h-5 bg-text-primary/70 rounded-full mx-0.5" />
            <div className="w-1 h-5 bg-text-secondary/40 rounded-full mx-0.5" />
          </div>
        </div>
      </div>
      <div className="flex justify-between w-72 mt-2 text-[10px] font-mono text-text-secondary/50 font-bold">
        <span>A</span>
        <span>0</span>
        <span>B</span>
      </div>
    </div>
  )
}
