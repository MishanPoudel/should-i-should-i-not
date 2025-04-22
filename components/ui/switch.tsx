"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"

interface SwitchProps {
  className?: string
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  name?: string
  id?: string
  required?: boolean
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled = false,
  name,
  id,
  required,
  ...props
}, ref) => {
  const theme = useTheme(false)
  const [isChecked, setIsChecked] = useState<boolean>(checked !== undefined ? checked : defaultChecked)

  // Update internal state when controlled value changes
  useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked)
    }
  }, [checked])

  const handleClick = () => {
    if (disabled) return

    const newChecked = !isChecked

    // Only update internal state if uncontrolled
    if (checked === undefined) {
      setIsChecked(newChecked)
    }

    // Call onChange handler
    onCheckedChange?.(newChecked)
  }

  // Generate unique ID for hidden input if not provided
  const inputId = id || name || React.useId()

  return (
    <React.Fragment>
      {/* Hidden input for form submission */}
      {name && (
        <input
          type="checkbox"
          name={name}
          id={inputId}
          checked={isChecked}
          onChange={() => { }}
          disabled={disabled}
          required={required}
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      )}

      {/* Visual switch component */}
      <button
        ref={ref}
        type="button"
        role="switch"
        data-slot="switch"
        data-state={isChecked ? "checked" : "unchecked"}
        aria-checked={isChecked}
        aria-required={required}
        disabled={disabled}
        onClick={handleClick}
        className={cn(
          "peer focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          isChecked ? "bg-blue-500" : "bg-neutral-400 dark:bg-input/80",
          className
        )}
        {...props}
      >
        <span
          data-slot="switch-thumb"
          data-state={isChecked ? "checked" : "unchecked"}
          className={cn(
            "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform",
            isChecked ? "translate-x-[calc(100%-2px)]" : "translate-x-0"
          )}
        />
      </button>
    </React.Fragment>
  )
})

Switch.displayName = "Switch"

export { Switch }