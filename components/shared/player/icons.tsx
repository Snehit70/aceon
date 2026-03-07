"use client";

interface AngularPlayIconProps {
  className?: string;
  fill?: string;
}

/**
 * AngularPlayIcon - Custom brutal-style play icon.
 * Used in video player for Chainsaw Man aesthetic.
 * Color: Blood Red (#E62E2D)
 */
export function AngularPlayIcon({ className = "w-10 h-10", fill = "#E62E2D" }: AngularPlayIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      aria-hidden="true"
    >
      <path d="M6 4.5L20.5 12L6 19.5V4.5Z" />
    </svg>
  );
}

interface AngularPauseIconProps {
  className?: string;
  fill?: string;
}

/**
 * AngularPauseIcon - Custom brutal-style pause icon.
 * Used in video player for Chainsaw Man aesthetic.
 * Color: Blood Red (#E62E2D)
 */
export function AngularPauseIcon({ className = "w-10 h-10", fill = "#E62E2D" }: AngularPauseIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      aria-hidden="true"
    >
      <rect x="5" y="4" width="4" height="16" rx="1" />
      <rect x="15" y="4" width="4" height="16" rx="1" />
    </svg>
  );
}
