import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { sendTelegramMessage } from "./notify.js";

describe("sendTelegramMessage", () => {
  const originalToken = process.env.TELEGRAM_BOT_TOKEN;
  const originalChatId = process.env.TELEGRAM_CHAT_ID;

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN;
    else process.env.TELEGRAM_BOT_TOKEN = originalToken;
    if (originalChatId === undefined) delete process.env.TELEGRAM_CHAT_ID;
    else process.env.TELEGRAM_CHAT_ID = originalChatId;
  });

  it("skips sending when TELEGRAM_BOT_TOKEN is missing", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    process.env.TELEGRAM_CHAT_ID = "chat-123";

    await sendTelegramMessage("hello");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("skips sending when TELEGRAM_CHAT_ID is missing", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "token-123";
    delete process.env.TELEGRAM_CHAT_ID;

    await sendTelegramMessage("hello");

    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends when both are set", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "token-123";
    process.env.TELEGRAM_CHAT_ID = "chat-123";
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }));

    await sendTelegramMessage("hello");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.telegram.org/bottoken-123/sendMessage",
      expect.objectContaining({ method: "POST" }),
    );
  });
});
