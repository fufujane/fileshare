# 📦 Share Box · 檔案與文字分享站

輕量的自架分享工具，支援上傳檔案（圖片／任意格式）與貼上文字，供下載與複製使用。

## 功能

- 📁 上傳任意檔案（最大 50MB）
- 🖼 圖片自動縮圖預覽
- 📝 貼上文字片段，一鍵複製
- 🔗 檔案連結複製
- 🗑 刪除項目

## 本地開發

```bash
npm install
npm start
# 開啟 http://localhost:3000
```

## 部署到 Render.com

1. 將此資料夾推到 GitHub（private repo 即可）
2. 登入 [Render](https://render.com) → New → **Web Service**
3. 連接你的 GitHub repo
4. 設定：
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. 按 Deploy 即可

> ⚠️ 注意：Render 免費方案的磁碟是暫時性的（ephemeral），重新部署後上傳的檔案會消失。
> 若需要持久儲存，可升級到 Render Disk（付費），或改用 Cloudinary / S3 存放檔案。

## 技術棧

- Node.js + Express
- Multer（檔案上傳）
- 純 HTML/CSS/JS 前端（無框架）
