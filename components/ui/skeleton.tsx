import { cn } from "@/lib/utils"

/**
 * Skeleton - Loading placeholder component.
 *
 * **Context**: Animated placeholder shown while content is loading.
 * Used to indicate that data is being fetched and reduce perceived load time.
 *
 * **Visual**: Pulsing gray box that mimics the shape of upcoming content.
 *
 * @param props - Component props including className for sizing.
 * @returns Animated loading placeholder.
 */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-muted  animate-pulse", className)}
      {...props}
    />
  )
}

export { Skeleton }
