export interface AccountConfig {
  alias: string;
  sessionFile: string;
}

export interface RunConfig {
  headless: boolean;
  videosPerAccount: number;
  watchSeconds: number;
  accounts: AccountConfig[];
}

export interface AccountResult {
  account: string;
  status: "success" | "failure";
  videosWatched: number;
  error?: string;
}
