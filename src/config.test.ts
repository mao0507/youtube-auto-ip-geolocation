import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadConfig } from "./config.js";

function writeTempConfig(content: string): string {
  const dir = mkdtempSync(join(tmpdir(), "config-test-"));
  const path = join(dir, "config.json");
  writeFileSync(path, content);
  return path;
}

describe("loadConfig", () => {
  it("loads a valid config", () => {
    const path = writeTempConfig(
      JSON.stringify({
        headless: true,
        videosPerAccount: 2,
        watchSeconds: 10,
        accounts: [{ alias: "a", sessionFile: "sessions/a.json" }],
      }),
    );

    expect(loadConfig(path)).toEqual({
      headless: true,
      videosPerAccount: 2,
      watchSeconds: 10,
      accounts: [{ alias: "a", sessionFile: "sessions/a.json" }],
    });
  });

  it("rejects a config missing accounts", () => {
    const path = writeTempConfig(
      JSON.stringify({ headless: true, videosPerAccount: 1, watchSeconds: 10 }),
    );

    expect(() => loadConfig(path)).toThrow(/accounts/);
  });

  it("rejects a config with watchSeconds as a string", () => {
    const path = writeTempConfig(
      JSON.stringify({
        headless: true,
        videosPerAccount: 1,
        watchSeconds: "10",
        accounts: [],
      }),
    );

    expect(() => loadConfig(path)).toThrow(/watchSeconds/);
  });
});
