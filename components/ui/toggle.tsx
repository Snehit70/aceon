"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, pressed = false, onPressedChange, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={pressed}
        onClick={() => onPressedChange?.(!pressed)}
        className={cn(
          "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          pressed ? "bg-[#E62E2D]" : "bg-white/20",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
            pressed ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    );
  }
);
Toggle.displayName = "Toggle";

export { Toggle };