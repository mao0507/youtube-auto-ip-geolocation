import { chromium } from "playwright";
import { createInterface } from "node:readline/promises";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

const sessionFile = process.argv[2];
if (!sessionFile) {
  console.error("Usage: npm run login -- sessions/<account>.json");
  process.exit(1);
}

async function main() {
  // Google blocks OAuth-style sign-in from a browser it detects as
  // automation-driven ("This browser may be insecure"). Launching the
  // user's real installed Chrome instead of the bundled Chromium, with
  // the automation flag hidden, avoids that block.
  const browser = await chromium.launch({
    headless: false,
    channel: "chrome",
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("https://accounts.google.com/");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  await rl.question(
    "Log in manually in the opened browser (handle 2FA if prompted), then press Enter here to save the session...",
  );
  rl.close();

  mkdirSync(dirname(sessionFile), { recursive: true });
  await context.storageState({ path: sessionFile });
  console.log(`Session saved to ${sessionFile}`);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
