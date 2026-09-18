import { describe, expect, it, vi } from "vitest";
import { runAccount } from "./runAccount.js";
import type { YoutubePage } from "./youtubePage.js";
import type { AccountConfig } from "./types.js";

const account: AccountConfig = { alias: "test-account", sessionFile: "sessions/test-account.json" };

function fakePage(overrides: Partial<YoutubePage> = {}): YoutubePage {
  return {
    goto: vi.fn().mockResolvedValue(undefined),
    pickRandomVideo: vi.fn().mockResolvedValue(true),
    waitForPlaybackStart: vi.fn().mockResolvedValue(true),
    wait: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe("runAccount", () => {
  it("watches the configured number of videos and reports success", async () => {
    const page = fakePage();

    const result = await runAccount(account, { videosPerAccount: 2, watchSeconds: 10 }, page);

    expect(result).toEqual({ account: "test-account", status: "success", videosWatched: 2 });
    expect(page.pickRandomVideo).toHaveBeenCalledTimes(2);
    expect(page.wait).toHaveBeenCalledWith(10_000);
  });

  it("fails when no video is found on the feed", async () => {
    const page = fakePage({ pickRandomVideo: vi.fn().mockResolvedValue(false) });

    const result = await runAccount(account, { videosPerAccount: 1, watchSeconds: 10 }, page);

    expect(result.status).toBe("failure");
    expect(result.videosWatched).toBe(0);
    expect(result.error).toMatch(/no video found/);
  });

  it("fails when playback never starts", async () => {
    const page = fakePage({ waitForPlaybackStart: vi.fn().mockResolvedValue(false) });

    const result = await runAccount(account, { videosPerAccount: 1, watchSeconds: 10 }, page);

    expect(result.status).toBe("failure");
    expect(result.videosWatched).toBe(0);
    expect(result.error).toMatch(/never started playing/);
  });

  it("records partial progress when a later video in the run fails", async () => {
    const pickRandomVideo = vi
      .fn()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);
    const page = fakePage({ pickRandomVideo });

    const result = await runAccount(account, { videosPerAccount: 2, watchSeconds: 10 }, page);

    expect(result.status).toBe("failure");
    expect(result.videosWatched).toBe(1);
  });

  it("does not navigate back to the feed after the last video", async () => {
    const page = fakePage();

    await runAccount(account, { videosPerAccount: 1, watchSeconds: 10 }, page);

    expect(page.goto).toHaveBeenCalledTimes(1);
  });
});
