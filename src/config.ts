import { readFileSync } from "node:fs";
import type { AccountConfig, RunConfig } from "./types.js";

function isAccountConfig(value: unknown): value is AccountConfig {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AccountConfig).alias === "string" &&
    typeof (value as AccountConfig).sessionFile === "string"
  );
}

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
  if (!Array.isArray(c.accounts) || !c.accounts.every(isAccountConfig)) {
    throw new Error(
      `Invalid config at ${path}: "accounts" must be an array of { alias: string, sessionFile: string }`,
    );
  }
}

export function loadConfig(path = "config.json"): RunConfig {
  const raw = readFileSync(path, "utf-8");
  const parsed: unknown = JSON.parse(raw);
  assertRunConfig(parsed, path);
  return parsed;
}
