import "dotenv/config";
import { chromium, type Browser } from "playwright";
import { loadConfig } from "./config.js";
import { runAccount } from "./runAccount.js";
import { PlaywrightYoutubePage } from "./youtubePage.js";
import { formatSummary, sendTelegramMessage } from "./notify.js";
import type { AccountConfig, AccountResult, RunConfig } from "./types.js";

const MAX_ATTEMPTS = 3; // 1 initial + up to 2 retries

async function runAccountWithRetry(
  browser: Browser,
  account: AccountConfig,
  config: RunConfig,
): Promise<AccountResult> {
  let lastResult: AccountResult = {
    account: account.alias,
    status: "failure",
    videosWatched: 0,
    error: "not attempted",
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`[${account.alias}] attempt ${attempt}/${MAX_ATTEMPTS}`);
    try {
      const context = await browser.newContext({ storageState: account.sessionFile });
      try {
        const page = await context.newPage();
        const youtubePage = new PlaywrightYoutubePage(page);
        lastResult = await runAccount(account, config, youtubePage);
      } finally {
        await context.close();
      }
    } catch (err) {
      lastResult = {
        account: account.alias,
        status: "failure",
        videosWatched: 0,
        error: err instanceof Error ? err.message : String(err),
      };
    }

    if (lastResult.status === "success") {
      console.log(`[${account.alias}] success — watched ${lastResult.videosWatched} video(s)`);
      return lastResult;
    }
    console.log(`[${account.alias}] failed: ${lastResult.error}`);
  }

  return lastResult;
}

async function main() {
  const config = loadConfig();
  const results: AccountResult[] = [];

  const browser = await chromium.launch({ headless: config.headless });
  try {
    for (const account of config.accounts) {
      const result = await runAccountWithRetry(browser, account, config);
      results.push(result);
    }
  } finally {
    await browser.close();
  }

  const summary = formatSummary(results);
  console.log(summary);

  try {
    await sendTelegramMessage(summary);
  } catch (err) {
    console.error("Telegram notification failed:", err);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
