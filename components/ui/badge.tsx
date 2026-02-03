import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

/**
 * Badge - Status indicator and label component.
 * 
 * **Context**: Small inline element for displaying status, categories, or counts.
 * Similar to Button but smaller and for non-interactive display.
 * 
 * **Variants**:
 * - `default`: Primary colored badge.
 * - `secondary`: Muted background.
 * - `destructive`: Red-themed for warnings/errors.
 * - `outline`: Bordered style.
 * - `ghost`: Transparent with hover effect.
 * - `link`: Text-only with underline.
 * 
 * @param props - Component props including variant and asChild.
 * @returns Styled badge element.
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center  border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive/10 text-destructive shadow hover:bg-destructive/20 dark:bg-destructive/20",
        outline: "text-foreground",
        ghost: "hover:bg-muted hover:text-muted-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
