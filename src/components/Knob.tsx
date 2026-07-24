import React, { useRef, useState, useEffect } from 'react'

interface KnobProps {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
  label: string
  defaultValue?: number
  unit?: string
}

export const Knob: React.FC<KnobProps> = ({
  value,
  min,
  max,
  onChange,
  label,
  defaultValue = 0.0,
  unit = '',
}) => {
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartPos = useRef({ y: 0, value: 0 })

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    dragStartPos.current = {
      y: e.clientY,
      value: value,
    }
  }

  const handleDoubleClick = () => {
    onChange(defaultValue)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const deltaY = dragStartPos.current.y - e.clientY // upward drag increases value
      const range = max - min
      const sensitivity = 0.005 // adjust for faster/slower rotation
      const newValue = Math.min(
        max,
        Math.max(min, dragStartPos.current.value + deltaY * sensitivity * range),
      )
      onChange(newValue)
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
  }, [isDragging, min, max, onChange])

  // Calculate rotation angle (from -135deg to 135deg)
  const angle = ((value - min) / (max - min)) * 270 - 135

  // Display value formatted
  const displayValue = value.toFixed(2)

  return (
    <div className="flex flex-col items-center select-none">
      <span className="text-[10px] uppercase tracking-wider text-text-secondary font-sans mb-2 font-medium">
        {label}
      </span>
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className={`w-14 h-14 rounded-full border border-[var(--border-te)] flex items-center justify-center relative cursor-ns-resize shadow-[var(--shadow-ui)] bg-surface active:scale-[0.98] transition-transform duration-100`}
        style={{
          boxShadow: isDragging
            ? 'inset 0 2px 4px rgba(0,0,0,0.1), var(--shadow-ui)'
            : 'var(--shadow-ui)',
        }}
      >
        {/* Dial tick indicator */}
        <div
          className="w-1.5 h-4 bg-text-primary rounded-full absolute top-1 transition-transform duration-75"
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: '50% 24px',
          }}
        />
        {/* Subtle inner circle */}
        <div className="w-10 h-10 rounded-full border border-dashed border-text-secondary/15 flex items-center justify-center bg-background/5" />
      </div>
      <span className="text-[11px] font-mono text-text-primary mt-2 font-semibold">
        {displayValue}
        <span className="text-[9px] text-text-secondary/60 ml-0.5">{unit}</span>
      </span>
    </div>
  )
}
