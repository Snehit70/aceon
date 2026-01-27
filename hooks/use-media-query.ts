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
  const [mounted, setMounted] = useState(false);
  // Current match state of the media query.
  const [matches, setMatches] = useState(false);

  // Hydration: set mounted flag after first render to avoid SSR mismatch.
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Set up matchMedia listener once we are on the client.
  useEffect(() => {
    if (!mounted) return;
    const media = window.matchMedia(query);
    // Initialise state with current match.
    setMatches(media.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", handler);
    return () => {
      media.removeEventListener("change", handler);
    };
  }, [query, mounted]);

  // During SSR (mounted === false) we deliberately return false to avoid
  // hydration mismatches.
  return mounted ? matches : false;
}
