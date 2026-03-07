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

interface YouTubeIconProps {
  className?: string;
  fill?: string;
}

/**
 * YouTubeIcon - YouTube brand icon.
 * Used for "View on YouTube" button.
 */
export function YouTubeIcon({ className = "w-5 h-5", fill = "currentColor" }: YouTubeIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={fill}
      aria-hidden="true"
    >
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
