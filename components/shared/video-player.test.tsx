import { createRef } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import VideoPlayer, { type VideoPlayerRef } from "./video-player";

vi.mock("./landscape-hint", () => ({ default: () => null }));
vi.mock("./player", () => ({
  PlayerControls: ({ subtitlesAvailable, onToggleSubtitles }: {
    subtitlesAvailable: boolean;
    onToggleSubtitles: () => void;
  }) => <button disabled={!subtitlesAvailable} onClick={onToggleSubtitles}>CC</button>,
  PlayerOverlay: () => null,
  VolumeIndicator: () => null,
}));

type PlayerOptions = ConstructorParameters<typeof window.YT.Player>[1];
let options: PlayerOptions;
let tracks: unknown;
let modules: string[];
let player: ReturnType<typeof makePlayer>;

function makePlayer() {
  return {
    playVideo: vi.fn(), pauseVideo: vi.fn(), seekTo: vi.fn(),
    getCurrentTime: () => 1, getDuration: () => 100, getPlayerState: () => 1,
    getVolume: () => 100, setVolume: vi.fn(), isMuted: () => false,
    mute: vi.fn(), unMute: vi.fn(), setPlaybackRate: vi.fn(),
    getPlaybackRate: () => 1, getIframe: () => document.createElement("iframe"),
    destroy: vi.fn(), getOption: () => tracks, getOptions: () => modules,
    loadModule: vi.fn(() => { modules = ["captions"]; }),
    unloadModule: vi.fn(() => { modules = []; }),
  };
}

async function mountPlayer() {
  const ref = createRef<VideoPlayerRef>();
  await act(async () => { render(<VideoPlayer ref={ref} videoId="PHrN7yp1AJw" title="Lecture" />); });
  await act(async () => { window.onYouTubeIframeAPIReady?.(); });
  act(() => { options.events?.onReady?.({ target: player }); });
  return ref;
}

function startPlayback() {
  act(() => { options.events?.onStateChange?.({ data: 1, target: player }); });
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  tracks = undefined;
  modules = [];
  player = makePlayer();
  document.head.appendChild(document.createElement("script"));
  Object.defineProperty(window, "YT", { configurable: true, value: {
    Player: vi.fn(function (_id: string, config: PlayerOptions) { options = config; return player; }),
    PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0, BUFFERING: 3, CUED: 5 },
  } });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })));
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("caption source compatibility", () => {
  it("keeps CC available after playback starts with captions turned off", async () => {
    localStorage.setItem("aceon:captions-enabled", "off");
    tracks = [];
    const ref = await mountPlayer();
    startPlayback();
    act(() => { vi.advanceTimersByTime(6000); });
    expect(screen.getByRole("button", { name: "CC" })).toBeEnabled();
    act(() => { expect(ref.current?.toggleSubtitles()).toBe(true); });
    expect(player.loadModule).toHaveBeenCalledWith("captions");
  });

  it("keeps CC available when YouTube does not expose tracklist metadata", async () => {
    await mountPlayer();
    startPlayback();
    act(() => { vi.advanceTimersByTime(6000); });
    expect(screen.getByRole("button", { name: "CC" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "CC" }));
    expect(player.unloadModule).toHaveBeenCalledWith("captions");
  });

  it("suppresses native captions on ready when the stored preference is off", async () => {
    localStorage.setItem("aceon:captions-enabled", "off");
    modules = ["captions"];
    await mountPlayer();
    expect(player.unloadModule).toHaveBeenCalledWith("captions");
  });

  it("recovers CC when native tracks arrive after an empty-track timeout", async () => {
    tracks = [];
    modules = ["captions"];
    await mountPlayer();
    startPlayback();
    act(() => { vi.advanceTimersByTime(6000); });
    expect(screen.getByRole("button", { name: "CC" })).toBeDisabled();
    tracks = [{ languageCode: "en" }];
    act(() => { options.events?.onApiChange?.({ target: player }); });
    expect(screen.getByRole("button", { name: "CC" })).toBeEnabled();
  });

  it("detects captions through the documented module list when tracklist throws", async () => {
    player.getOption = () => { throw new Error("Unsupported option"); };
    modules = ["captions"];
    await mountPlayer();
    startPlayback();
    act(() => { vi.advanceTimersByTime(6000); });
    expect(screen.getByRole("button", { name: "CC" })).toBeEnabled();
    expect(player.loadModule).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "CC" }));
    expect(player.unloadModule).toHaveBeenCalledTimes(1);
    act(() => { options.events?.onApiChange?.({ target: player }); });
    expect(player.unloadModule).toHaveBeenCalledTimes(1);
  });

  it("still toggles native captions when module inspection throws", async () => {
    player.getOptions = () => { throw new Error("Unavailable module listing"); };
    const ref = await mountPlayer();
    startPlayback();
    act(() => { vi.advanceTimersByTime(6000); });
    expect(screen.getByRole("button", { name: "CC" })).toBeEnabled();
    act(() => { expect(ref.current?.toggleSubtitles()).toBe(false); });
    expect(player.unloadModule).toHaveBeenCalledWith("captions");
  });

  it("uses stored VTT for CC and suppresses duplicate native captions", async () => {
    modules = ["captions"];
    vi.mocked(fetch).mockResolvedValue(new Response("WEBVTT\n\n00:00:00.000 --> 00:00:03.000\nStored subtitle\n"));
    const ref = await mountPlayer();
    startPlayback();
    act(() => { vi.advanceTimersByTime(250); });
    expect(screen.getByText("Stored subtitle")).toBeInTheDocument();
    expect(player.unloadModule).toHaveBeenCalledWith("captions");
    player.loadModule.mockClear();
    act(() => { ref.current?.toggleSubtitles(); });
    expect(screen.queryByText("Stored subtitle")).not.toBeInTheDocument();
    act(() => { ref.current?.toggleSubtitles(); });
    expect(player.loadModule).not.toHaveBeenCalled();
  });
});
