# YouTube 多帳號自動觀看腳本

## 用途
個人帳號自動化習慣：自動登入自己設定的多個 Google 帳號，逐一前往 YouTube 觀看訂閱 feed 隨機推薦影片約 10 秒，模擬簽到式觀看。非用於刷觀看數/影響他人頻道數據。

## 技術棧
- TypeScript + Node.js
- Playwright（Chromium）

## 帳號與登入
- 每個帳號先各跑一次「手動登入」腳本：headed 模式開瀏覽器 → 人工輸入帳密/2FA → 登入完成後按 Enter → 存 `sessions/<account>.json`（Playwright storageState）。
- 正式排程執行時，直接載入對應 session json，不再輸入密碼。
- `sessions/*.json` 加入 `.gitignore`，不進版控。
- 帳號清單於 `config.json`（或 `accounts.ts`）維護：帳號代稱、session 檔路徑。

## 執行流程（每帳號）
1. 用該帳號 session 開新 browser context。
2. 前往 YouTube 首頁/訂閱 feed。
3. 隨機挑一支推薦影片點擊觀看。
4. 確認影片「實際開始播放」（非暫停/緩衝）才開始計時 10 秒。
5. 依 config 設定的 N 支影片重複步驟 2-4。
6. 關閉 context，換下一帳號（不加隨機延遲，依序立即執行）。
7. 單一帳號登入或觀看失敗：重試 1–2 次，仍失敗則記錄原因並跳過，不影響其他帳號。

## 設定項（config）
- `headless: boolean`（切換瀏覽器視窗顯示/背景執行）
- `videosPerAccount: number`（每帳號觀看支數 N）
- `watchSeconds: number`（預設 10）
- 帳號清單（代稱 + session 檔路徑）

## IP/地區
不做 proxy 或地區模擬，使用本機 IP。

## 通知
全部帳號跑完後，用 Bot Token 直接呼叫 Telegram API 發送結果（成功/失敗清單）。
- 需先於 @BotFather 建立 bot 取得 token，並取得自己的 chat id。
- `TELEGRAM_BOT_TOKEN`、`TELEGRAM_CHAT_ID` 放 `.env`（`.gitignore` 排除）。

## 觸發方式
Windows 工作排程器定時自動執行。

## 專案骨架（待建立）
- `package.json`
- `config.json`
- `.env.example` / `.gitignore`
- `src/login.ts`（手動登入單一帳號，產生 session）
- `src/watch.ts`（單帳號觀看流程）
- `src/main.ts`（讀 config、依序跑所有帳號、彙整結果、發 Telegram 通知）
- `sessions/`（session json 存放，gitignore）
