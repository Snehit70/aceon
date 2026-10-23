import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SkipIntroButton, { type SkipIntroPlayer } from "./skip-intro-button";

function makePlayer(currentTime = 0, duration = 1800): SkipIntroPlayer & { currentTime: number } {
  const player = {
    currentTime,
    seekTo: vi.fn((seconds: number) => {
      player.currentTime = seconds;
    }),
    getCurrentTime: () => player.currentTime,
    getDuration: () => duration,
  };
  return player;
}

describe("SkipIntroButton", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("shows Skip intro during the bumper and seeks on click", () => {
    const player = makePlayer(2, 1800);
    const playerRef = createRef<SkipIntroPlayer | null>();
    playerRef.current = player;

    render(
      <SkipIntroButton
        playerRef={playerRef}
        isReady
        introSeconds={10}
        autoSkip={false}
        videoId="abc"
      />,
    );

    act(() => {
      vi.advanceTimersByTime(0);
    });

    fireEvent.click(screen.getByRole("button", { name: "Skip intro" }));
    expect(player.seekTo).toHaveBeenCalledWith(10);
    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
  });

  it("hides once playback is past the intro", () => {
    const player = makePlayer(40, 1800);
    const playerRef = createRef<SkipIntroPlayer | null>();
    playerRef.current = player;

    render(
      <SkipIntroButton
        playerRef={playerRef}
        isReady
        introSeconds={10}
        autoSkip={false}
        videoId="abc"
      />,
    );

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();
  });

  it("auto-skips once at the start when the setting is on", () => {
    const player = makePlayer(0, 1800);
    const playerRef = createRef<SkipIntroPlayer | null>();
    playerRef.current = player;

    render(
      <SkipIntroButton
        playerRef={playerRef}
        isReady
        introSeconds={15}
        autoSkip
        videoId="abc"
      />,
    );

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(player.seekTo).toHaveBeenCalledTimes(1);
    expect(player.seekTo).toHaveBeenCalledWith(15);
    expect(screen.queryByRole("button", { name: "Skip intro" })).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(250);
    });

    player.currentTime = 3;

    act(() => {
      vi.advanceTimersByTime(250);
    });

    expect(player.seekTo).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Skip intro" })).toBeInTheDocument();
  });
});
