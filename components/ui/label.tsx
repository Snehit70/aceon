"use client"

import * as React from "react"
import { Label as LabelPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Label - Form field label component.
 *
 * **Context**: Accessible label for form inputs. Automatically associates with
 * input fields and supports disabled states.
 *
 * **Integrations**:
 * - Radix UI Label: Handles accessibility and input association.
 *
 * @param props - Component props including htmlFor (associates with input ID).
 * @returns Styled form label.
 */
function Label({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "gap-2 text-sm leading-none font-medium group-data-[disabled=true]:opacity-50 peer-disabled:opacity-50 flex items-center select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  )
}

export { Label }
