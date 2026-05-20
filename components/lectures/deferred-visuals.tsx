"use client";

import { useEffect, useState } from "react";

/**
 * DeferredVisuals
 *
 * Renders non-critical decorative layers after mount so primary content
 * can paint and become interactive sooner.
 */
export default function DeferredVisuals() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setShow(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!show) return null;

  return (
    <>
      <div className="fixed inset-0 bg-[url('/images/halftone.svg')] opacity-5 pointer-events-none mix-blend-screen z-0" />
      <div className="fixed inset-0 bg-[url('/images/noise.svg')] opacity-10 pointer-events-none mix-blend-overlay z-0" />
      <div
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 4px,
            #ffffff 4px,
            #ffffff 5px
          )`,
        }}
      />
      <div className="fixed inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-0" />
    </>
  );
}
