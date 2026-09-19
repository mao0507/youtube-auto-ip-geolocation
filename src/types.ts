export interface AccountConfig {
  alias: string;
  sessionFile: string;
}

export interface RunConfig {
  headless: boolean;
  videosPerAccount: number;
  watchSeconds: number;
  /** Aliases (session filename minus .json) to skip even though a session file exists. */
  skipAccounts: string[];
}

export interface AccountResult {
  account: string;
  status: "success" | "failure";
  videosWatched: number;
  error?: string;
}
