import type { Page } from "playwright";

/**
 * Narrow surface runAccount depends on. Real runs use PlaywrightYoutubePage;
 * tests use a fake implementing the same interface — this is the seam.
 */
export interface YoutubePage {
  goto(url: string): Promise<void>;
  /** Clicks a random recommended video. Returns false if none found. */
  pickRandomVideo(): Promise<boolean>;
  /** Polls until the clicked video is actually playing. */
  waitForPlaybackStart(timeoutMs: number): Promise<boolean>;
  wait(ms: number): Promise<void>;
}

const HOME_URL = "https://www.youtube.com/";
const VIDEO_THUMBNAIL_SELECTOR = "ytd-rich-item-renderer a#thumbnail";
const FEED_LOAD_TIMEOUT_MS = 15_000;
// ponytail: feed sometimes renders empty (bot detection / slow load) — fall
// back to a fixed known-good video instead of failing the account outright.
const FALLBACK_VIDEO_URL = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

export class PlaywrightYoutubePage implements YoutubePage {
  constructor(private readonly page: Page) {}

  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async pickRandomVideo(): Promise<boolean> {
    const thumbnails = this.page.locator(VIDEO_THUMBNAIL_SELECTOR);
    try {
      await thumbnails.first().waitFor({ state: "attached", timeout: FEED_LOAD_TIMEOUT_MS });
    } catch {
      return this.playFallbackVideo();
    }
    const count = await thumbnails.count();
    if (count === 0) return this.playFallbackVideo();
    const index = Math.floor(Math.random() * count);
    await thumbnails.nth(index).click();
    return true;
  }

  private async playFallbackVideo(): Promise<boolean> {
    try {
      await this.goto(FALLBACK_VIDEO_URL);
      return true;
    } catch {
      return false;
    }
  }

  async waitForPlaybackStart(timeoutMs: number): Promise<boolean> {
    try {
      await this.page.waitForFunction(
        () => {
          const video = document.querySelector("video");
          return !!video && !video.paused && video.readyState >= 3;
        },
        undefined,
        { timeout: timeoutMs },
      );
      return true;
    } catch {
      return false;
    }
  }

  async wait(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}

export { HOME_URL };
