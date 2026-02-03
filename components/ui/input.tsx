import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Input - Form text input element.
 * 
 * **Context**: Standard text input for forms and user data entry.
 * Styled consistently with the design system and supports all HTML input types.
 * 
 * **Features**:
 * - Full width by default.
 * - Focus ring styling.
 * - File input styling support.
 * - Disabled state handling.
 * 
 * @param props - Standard HTML input props plus className.
 * @returns Styled input element.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full  border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
