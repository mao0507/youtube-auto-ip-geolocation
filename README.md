# youtube-auto-ip-geolocation

中文版說明請見 [README.zh-TW.md](./README.zh-TW.md)。

Personal automation: logs into your own Google accounts (via saved sessions) and watches a random recommended YouTube video for ~10 seconds per account, on a schedule. See `TICKET.md` and [issue #1](https://github.com/mao0507/youtube-auto-ip-geolocation/issues/1) for the full spec.

Not for inflating view counts or manipulating anyone else's content — personal-account habit automation only.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # fill in TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
```

Edit `config.json`: set `headless`, `videosPerAccount`, `watchSeconds`, and (optionally) `skipAccounts`.

You don't list accounts in `config.json` — the script scans `sessions/` and runs one account per `<alias>.json` file it finds there. To save a login session for an account:

```bash
npm run login -- sessions/<alias>.json
```

A browser opens — log in manually (handle 2FA if prompted), then press Enter in the terminal to save the session to `sessions/<alias>.json`. `npm start` will pick it up automatically next run. To temporarily exclude an account without deleting its session file, add its alias to `skipAccounts` in `config.json`.

## Run

```bash
npm start
```

Each account is retried up to 2 times on failure (login/navigation/playback issues) before being skipped; the run never aborts because of one bad account. `config.json` is validated on load — a missing/mistyped field fails fast with a clear error instead of a confusing crash later. A Telegram summary (who succeeded/failed and why) is sent at the end; if Telegram itself is unreachable, that's logged but doesn't fail the run.

If the recommendation feed fails to load within 15s (slow network, bot detection, region quirks), the script falls back to a fixed known-good video instead of failing the account. Any failed attempt also saves a screenshot to `debug/<alias>-attempt<N>.png` so you can see what the page looked like.

Set `headless: false` in `config.json` to watch the browser window while it runs (useful for debugging); `true` for unattended runs.

Schedule `npm start` via Windows Task Scheduler for unattended runs.

## Project layout

- `src/runAccount.ts` — core single-account flow (pick a video, confirm it's playing, watch, repeat). The seam: tested against a fake `YoutubePage`, never real YouTube.
- `src/youtubePage.ts` — `YoutubePage` interface + the real Playwright implementation.
- `src/main.ts` — orchestrator: iterates accounts, retries, sends the Telegram summary.
- `src/login.ts` — one-off interactive script to save a session file per account.
- `src/config.ts` / `src/notify.ts` — config loading+validation, Telegram formatting/sending.

## Test

```bash
npm run typecheck
npm test
```
