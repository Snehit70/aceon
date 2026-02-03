"use client"

import * as React from "react"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Progress - Linear progress indicator.
 * 
 * **Context**: Visual indicator for completion percentage (0-100).
 * Used for course progress, upload status, or any measurable progress.
 * 
 * **Integrations**:
 * - Radix UI Progress: Handles accessibility and value management.
 * 
 * @param props - Component props including value (0-100).
 * @returns Horizontal progress bar.
 */
function Progress({
  className,
  value,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-muted h-1  relative flex w-full items-center overflow-x-hidden",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="bg-primary size-full flex-1 transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
