import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { AccountConfig, RunConfig } from "./types.js";

function assertRunConfig(value: unknown, path: string): asserts value is RunConfig {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Invalid config at ${path}: expected an object`);
  }
  const c = value as Partial<RunConfig>;

  if (typeof c.headless !== "boolean") {
    throw new Error(`Invalid config at ${path}: "headless" must be a boolean`);
  }
  if (typeof c.videosPerAccount !== "number" || c.videosPerAccount < 1) {
    throw new Error(`Invalid config at ${path}: "videosPerAccount" must be a number >= 1`);
  }
  if (typeof c.watchSeconds !== "number" || c.watchSeconds < 0) {
    throw new Error(`Invalid config at ${path}: "watchSeconds" must be a non-negative number`);
  }
  if (c.skipAccounts !== undefined) {
    if (!Array.isArray(c.skipAccounts) || !c.skipAccounts.every((a) => typeof a === "string")) {
      throw new Error(`Invalid config at ${path}: "skipAccounts" must be an array of strings`);
    }
  }
}

export function loadConfig(path = "config.json"): RunConfig {
  const raw = readFileSync(path, "utf-8");
  const parsed: unknown = JSON.parse(raw);
  assertRunConfig(parsed, path);
  return { ...parsed, skipAccounts: parsed.skipAccounts ?? [] };
}

/**
 * One account per session file under sessionsDir, alias = filename minus
 * ".json". Add to `skipAccounts` in config.json to exclude one without
 * deleting its session file.
 */
export function listAccounts(sessionsDir: string, skipAccounts: string[]): AccountConfig[] {
  let files: string[];
  try {
    files = readdirSync(sessionsDir);
  } catch {
    return [];
  }

  return files
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.slice(0, -".json".length))
    .filter((alias) => !skipAccounts.includes(alias))
    .sort()
    .map((alias) => ({ alias, sessionFile: join(sessionsDir, `${alias}.json`) }));
}
