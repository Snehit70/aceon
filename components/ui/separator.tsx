"use client"

import * as React from "react"
import { Separator as SeparatorPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Separator - Visual divider component.
 *
 * **Context**: Horizontal or vertical line to separate content sections.
 * Used in menus, forms, and lists to create visual hierarchy.
 *
 * **Features**:
 * - Horizontal or vertical orientation.
 * - Semantic by default (visible to screen readers), can be set to decorative.
 *
 * @param props - Component props including orientation.
 * @returns Styled divider line.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = false,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
