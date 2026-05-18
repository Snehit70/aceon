import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useAutoplay } from "./use-autoplay";

describe("useAutoplay", () => {
  it("counts down and autoplays next video", () => {
    vi.useFakeTimers();
    const onAutoplay = vi.fn();
    const { result } = renderHook(() => useAutoplay({ onAutoplay }));

    act(() => {
      result.current.startCountdown("video-2");
    });

    expect(result.current.showCountdown).toBe(true);
    expect(result.current.countdown).toBe(10);

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(onAutoplay).toHaveBeenCalledWith("video-2");
    expect(result.current.showCountdown).toBe(false);
    expect(result.current.countdown).toBe(10);
    vi.useRealTimers();
  });

  it("cancels autoplay before countdown ends", () => {
    vi.useFakeTimers();
    const onAutoplay = vi.fn();
    const { result } = renderHook(() => useAutoplay({ onAutoplay }));

    act(() => {
      result.current.startCountdown("video-3");
      vi.advanceTimersByTime(3_000);
      result.current.cancelAutoplay();
      vi.advanceTimersByTime(10_000);
    });

    expect(onAutoplay).not.toHaveBeenCalled();
    expect(result.current.showCountdown).toBe(false);
    expect(result.current.countdown).toBe(10);
    vi.useRealTimers();
  });
});
