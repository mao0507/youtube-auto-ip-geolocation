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

Schedule this via Windows Task Scheduler for unattended runs.

## Test

```bash
npm run typecheck
npm test
```
