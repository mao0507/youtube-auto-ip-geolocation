import type { AccountConfig, AccountResult, RunConfig } from "./types.js";
import { HOME_URL, type YoutubePage } from "./youtubePage.js";

const PLAYBACK_START_TIMEOUT_MS = 10_000;

export async function runAccount(
  account: AccountConfig,
  config: Pick<RunConfig, "videosPerAccount" | "watchSeconds">,
  page: YoutubePage,
): Promise<AccountResult> {
  let videosWatched = 0;

  try {
    await page.goto(HOME_URL);

    for (let i = 0; i < config.videosPerAccount; i++) {
      const picked = await page.pickRandomVideo();
      if (!picked) {
        throw new Error("no video found to watch");
      }

      const started = await page.waitForPlaybackStart(PLAYBACK_START_TIMEOUT_MS);
      if (!started) {
        throw new Error("video never started playing");
      }

      await page.wait(config.watchSeconds * 1000);
      videosWatched++;

      if (i < config.videosPerAccount - 1) {
        await page.goto(HOME_URL);
      }
    }

    return { account: account.alias, status: "success", videosWatched };
  } catch (err) {
    return {
      account: account.alias,
      status: "failure",
      videosWatched,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
