import { readFileSync } from "node:fs";
import type { RunConfig } from "./types.js";

export function loadConfig(path = "config.json"): RunConfig {
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as RunConfig;
}
