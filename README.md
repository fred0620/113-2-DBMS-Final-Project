# 113-2-DBMS-Final-Project（React + Express 架構）
Group6 Standard Operating Procedure (SOP) Database

## 📁 專案架構說明

```
113-2-DBMS-Final-Project/
├── index.html               # React SPA 頁面容器（不需更動）
├── package.json             # 所有依賴與執行指令集中於此
├── vite.config.js           # 前端設定，包含 API proxy 與 plugin 設定
│
├── src/                     # 前端原始碼
│   ├── index.js             # 入口點（掛載 React App）
│   ├── App.js               # 根組件
│   ├── pages/               # 各個頁面（e.g. Home, Editor）
│   ├── components/          # 可重用的 UI 元件
│   └── ...                  # 可自行擴充 utils, services 等資料夾
│
└── server/                  # 後端 Express 原始碼
    ├── index.js            # Express server 啟動點
    └── routes/             # 路由模組（e.g. /api/sops）
```

---

## 🚀 如何啟動專案

### ✅ Step 1：安裝 Node.js 與 pnpm

我們使用 [Node.js 20 LTS](https://nodejs.org/en) 以及 [pnpm](https://pnpm.io)

安裝 pnpm（如尚未安裝）：
```bash
npm install -g pnpm
```

---

### ✅ Step 2：安裝所有依賴

在專案根目錄執行：

```bash
pnpm install -r
```

這會安裝前端、後端所有依賴。

---

### ✅ Step 3：啟動前後端伺服器

```bash
pnpm run dev
```

成功後你會看到以下訊息：
```
➜  Local:   http://localhost:5173/     (React 前端)
Server is running on http://localhost:3000   (Express 後端 API)
```

請用瀏覽器打開 `http://localhost:5173/`

---

## 📌 補充注意事項

### Windows 使用者請特別注意：
- 請安裝 [nvm-windows](https://github.com/coreybutler/nvm-windows) 並切換至 Node.js 20
- 執行 `pnpm` 指令前，請確認已安裝 `pnpm`（可用 `pnpm -v` 檢查）
- 專案路徑請避免中文資料夾，建議改為英文資料夾路徑

---

### ⚙️ JSX 使用說明（目前預設 **未使用 JSX**）

目前專案採用 `React.createElement()` 語法以避免 plugin 衝突。  
未來如需改回 JSX：

1. 將 `.js` 改為 `.jsx`
2. 在 `vite.config.js` 中保留 `@vitejs/plugin-react`
3. 使用 `<App />` 這類語法即可正常開發

---

## 🧪 成功畫面示意

啟動後瀏覽器畫面應如下：

```
🎉 前後端整合成功
從後端取得的資料：
{
  "success": true,
  "data": "Hello from backend!"
}
```

---

📮 有任何問題請直接看 `vite.config.js` 與 `server/index.js`，我們已盡量保持架構清晰！

```
