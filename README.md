# youtube-auto-ip-geolocation

Personal automation: logs into your own Google accounts (via saved sessions) and watches a random recommended YouTube video for ~10 seconds per account, on a schedule. See `TICKET.md` and [issue #1](https://github.com/mao0507/youtube-auto-ip-geolocation/issues/1) for the full spec.

Not for inflating view counts or manipulating anyone else's content — personal-account habit automation only.

## Setup

```bash
npm install
npx playwright install chromium
cp .env.example .env   # fill in TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
```

Edit `config.json`: set `headless`, `videosPerAccount`, `watchSeconds`, and the `accounts` list (alias + session file path).

For each account, save a login session once:

```bash
npm run login -- sessions/<alias>.json
```

A browser opens — log in manually (handle 2FA if prompted), then press Enter in the terminal to save the session.

## Run

```bash
npm start
```

Each account is retried up to 2 times on failure (login/navigation/playback issues) before being skipped; the run never aborts because of one bad account. `config.json` is validated on load — a missing/mistyped field fails fast with a clear error instead of a confusing crash later. A Telegram summary (who succeeded/failed and why) is sent at the end; if Telegram itself is unreachable, that's logged but doesn't fail the run.

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
