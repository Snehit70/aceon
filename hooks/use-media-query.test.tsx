import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import useMediaQuery from "./use-media-query";

function setupMatchMedia(initialMatch: boolean) {
  let matches = initialMatch;
  const listeners = new Set<(event: MediaQueryListEvent) => void>();

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: "(max-width: 768px)",
      onchange: null,
      addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => listeners.delete(listener),
      dispatchEvent: () => true,
    })),
  });

  return {
    setMatches(next: boolean) {
      matches = next;
      listeners.forEach((listener) => listener({ matches: next } as MediaQueryListEvent));
    },
  };
}

describe("useMediaQuery", () => {
  it("tracks media query changes", async () => {
    vi.useFakeTimers();
    const media = setupMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(max-width: 768px)"));

    expect(result.current).toBe(false);

    await act(async () => {
      vi.runAllTimers();
    });

    act(() => {
      media.setMatches(true);
    });

    expect(result.current).toBe(true);
    vi.useRealTimers();
  });
});
