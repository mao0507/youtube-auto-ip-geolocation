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

export class PlaywrightYoutubePage implements YoutubePage {
  constructor(private readonly page: Page) {}

  async goto(url: string): Promise<void> {
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  async pickRandomVideo(): Promise<boolean> {
    const thumbnails = this.page.locator(VIDEO_THUMBNAIL_SELECTOR);
    const count = await thumbnails.count();
    if (count === 0) return false;
    const index = Math.floor(Math.random() * count);
    await thumbnails.nth(index).click();
    return true;
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
