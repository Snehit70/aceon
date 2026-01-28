import { useEffect, useState } from "react";

/**
 * useMediaQuery – React hook for CSS media queries.
 *
 * Returns `true` when the supplied query matches the current viewport.
 * Handles server‑side rendering by returning `false` until the component is
 * mounted on the client, then synchronises with `window.matchMedia`.
 */
export default function useMediaQuery(query: string): boolean {
  // Track whether the component has mounted (client‑side only).
  // Current match state of the media query, initialized lazily for SSR safety.
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  // Set up matchMedia listener and keep state in sync.
  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    // Ensure state reflects current match (covers query changes).
    setTimeout(() => setMatches(media.matches), 0);
    media.addEventListener("change", handler);
    return () => {
      media.removeEventListener("change", handler);
    };
  }, [query]);

  // Return the current match state.
  return matches;
}
