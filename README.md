# Zuno

一個仿 Twitter 的社群媒體平台，作為前端訓練課程的畢業專案。

## 技術棧

- Vue 3 Composition API
- Vue Router（含路由守衛）
- Naive UI 元件庫
- Vite
- Axios
- localStorage 狀態管理

## 功能介紹

**使用者前台**
- 會員註冊 / 登入 / 登出
- 發布、瀏覽推文
- 按讚 / 取消按讚
- 追蹤 / 取消追蹤
- 個人頁面與頭像管理

**後台管理介面**
- 管理員登入
- 使用者管理
- 推文管理

## 線上 Demo

🔗 [點此體驗](https://jojo920912-maker.github.io/social-media-zuno/)

⚠️ 首次載入可能需要等待約 30 秒，為 Render 免費方案喚醒時間，請稍候。

## 測試帳號

| 角色 | 帳號 | Email | 密碼 |
|------|------|-------|------|
| Super User | test | test@gmail.com | 12345678 |
| Admin | root | root@example.com | 12345678 |
| 一般用戶 | user1 | user1@example.com | 12345678 |

## 啟動專案

```bash
# 安裝依賴
npm install

# 啟動開發環境
npm start
```

## 專案結構

```
src/
├── pages/        # 頁面元件
├── components/   # 共用元件
├── router/       # 路由設定
├── api/          # API 串接
└── utils/        # 工具函式
```