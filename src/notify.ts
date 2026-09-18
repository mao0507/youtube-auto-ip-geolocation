import type { AccountResult } from "./types.js";

export function formatSummary(results: AccountResult[]): string {
  const lines = results.map((r) =>
    r.status === "success"
      ? `✅ ${r.account} — watched ${r.videosWatched}`
      : `❌ ${r.account} — ${r.error ?? "unknown error"}`,
  );
  return ["YouTube auto-watch run finished:", ...lines].join("\n");
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.warn("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set — skipping Telegram notification.");
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!res.ok) {
    console.error(`Telegram notification failed: ${res.status} ${await res.text()}`);
  }
}
