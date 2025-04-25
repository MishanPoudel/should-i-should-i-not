"use client"

import React, { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"

interface SliderProps {
  className?: string
  min?: number
  max?: number
  step?: number
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  orientation?: "horizontal" | "vertical"
  disabled?: boolean
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(({
  className,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue = [0],
  onValueChange,
  orientation = "horizontal",
  disabled = false,
  ...props
}, ref) => {
  const theme = useTheme(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const isHorizontal = orientation === "horizontal"

  // Use controlled or uncontrolled value
  const [internalValue, setInternalValue] = useState<number[]>(
    Array.isArray(value) ? value :
      Array.isArray(defaultValue) && defaultValue.length > 0 ? defaultValue : [min]
  )

  // Update internal value when controlled value changes
  useEffect(() => {
    if (Array.isArray(value)) {
      setInternalValue(value)
    }
  }, [value])

  // Ensure value is within min/max bounds
  const safeValue = internalValue.map(v => Math.min(Math.max(v, min), max))

  // Calculate percentage for positioning
  const getPercentage = (value: number) => ((value - min) / (max - min)) * 100

  // Handle track click
  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !trackRef.current) return

    const rect = trackRef.current.getBoundingClientRect()
    const position = isHorizontal
      ? (e.clientX - rect.left) / rect.width
      : (e.clientY - rect.top) / rect.height

    const newValue = min + position * (max - min)
    const steppedValue = Math.round(newValue / step) * step
    const clampedValue = Math.min(Math.max(steppedValue, min), max)

    const newValues = [...safeValue]
    newValues[0] = clampedValue

    setInternalValue(newValues)
    onValueChange?.(newValues)
  }

  // Handle thumb drag
  const handleThumbDrag = (index: number) => {
    if (disabled) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return

      const rect = trackRef.current.getBoundingClientRect()
      const position = isHorizontal
        ? (e.clientX - rect.left) / rect.width
        : (e.clientY - rect.top) / rect.height

      const newValue = min + position * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      const clampedValue = Math.min(Math.max(steppedValue, min), max)

      const newValues = [...safeValue]
      newValues[index] = clampedValue

      setInternalValue(newValues)
      onValueChange?.(newValues)
    }

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div
      ref={ref}
      className={cn(
        "relative flex touch-none select-none items-center hover:cursor-pointer",
        isHorizontal ? "w-full" : "h-full min-h-44 flex-col",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      {...props}
    >
      {/* Track */}
      <div
        ref={trackRef}
        className={cn(
          "bg-muted relative grow overflow-hidden rounded-full",
          isHorizontal ? "h-1.5 w-full" : "h-full w-1.5"
        )}
        onClick={handleTrackClick}
      >
        {/* Range */}
        <div
          className={cn(
            theme.rangeBg,
            "absolute",
            isHorizontal ? "h-full left-0" : "w-full bottom-0"
          )}
          style={{
            [isHorizontal ? 'width' : 'height']: `${getPercentage(safeValue[0])}%`
          }}
        />
      </div>

      {/* Thumbs */}
      {safeValue.map((val, index) => (
        <div
          key={index}
          className={cn(
            "border-primary bg-background absolute block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-0 focus-visible:ring-4 focus-visible:outline-none",
            isHorizontal ? "-translate-x-1/2 -translate-y-1/2" : "translate-x-1/2 translate-y-1/2"
          )}
          style={{
            [isHorizontal ? 'left' : 'bottom']: `${getPercentage(val)}%`,
            [isHorizontal ? 'top' : 'left']: '50%',
            cursor: disabled ? 'not-allowed' : 'grab'
          }}
          onMouseDown={() => handleThumbDrag(index)}
          tabIndex={disabled ? -1 : 0}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={val}
          aria-orientation={orientation}
          aria-disabled={disabled}
        />
      ))}
    </div>
  )
})

Slider.displayName = "Slider"

export { Slider }