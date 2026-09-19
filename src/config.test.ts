import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { listAccounts, loadConfig } from "./config.js";

function writeTempConfig(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), "config-test-"));
  const path = join(dir, "config.json");
  writeFileSync(path, content);
  return path;
}

describe("loadConfig", () => {
  it("loads a valid config and defaults skipAccounts to []", () => {
    const path = writeTempConfig(
      JSON.stringify({ headless: true, videosPerAccount: 2, watchSeconds: 10 }),
    );

    expect(loadConfig(path)).toEqual({
      headless: true,
      videosPerAccount: 2,
      watchSeconds: 10,
      skipAccounts: [],
    });
  });

  it("keeps an explicit skipAccounts list", () => {
    const path = writeTempConfig(
      JSON.stringify({
        headless: true,
        videosPerAccount: 1,
        watchSeconds: 10,
        skipAccounts: ["account-2"],
      }),
    );

    expect(loadConfig(path).skipAccounts).toEqual(["account-2"]);
  });

  it("rejects a config with watchSeconds as a string", () => {
    const path = writeTempConfig(
      JSON.stringify({ headless: true, videosPerAccount: 1, watchSeconds: "10" }),
    );

    expect(() => loadConfig(path)).toThrow(/watchSeconds/);
  });

  it("rejects a config with a non-array skipAccounts", () => {
    const path = writeTempConfig(
      JSON.stringify({
        headless: true,
        videosPerAccount: 1,
        watchSeconds: 10,
        skipAccounts: "account-2",
      }),
    );

    expect(() => loadConfig(path)).toThrow(/skipAccounts/);
  });
});

describe("listAccounts", () => {
  function tempSessionsDir(aliases: string[]): string {
    const dir = mkdtempSync(join(tmpdir(), "sessions-test-"));
    for (const alias of aliases) {
      writeFileSync(join(dir, `${alias}.json`), "{}");
    }
    writeFileSync(join(dir, "not-a-session.txt"), "ignore me");
    return dir;
  }

  it("lists one account per session file, ignoring non-json files", () => {
    const dir = tempSessionsDir(["account-1", "account-2"]);

    expect(listAccounts(dir, [])).toEqual([
      { alias: "account-1", sessionFile: join(dir, "account-1.json") },
      { alias: "account-2", sessionFile: join(dir, "account-2.json") },
    ]);
  });

  it("excludes aliases in skipAccounts", () => {
    const dir = tempSessionsDir(["account-1", "account-2"]);

    expect(listAccounts(dir, ["account-2"])).toEqual([
      { alias: "account-1", sessionFile: join(dir, "account-1.json") },
    ]);
  });

  it("returns an empty list when the sessions dir doesn't exist", () => {
    expect(listAccounts(join(tmpdir(), "does-not-exist-" + Date.now()), [])).toEqual([]);
  });
});
