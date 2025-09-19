# Church MERN (Nhà thờ Công giáo)

Dự án MERN (MongoDB, Express, React, Node.js) cho website nhà thờ. Giai đoạn đầu: trang Home (tiếng Việt) giống mẫu screenshot, có trang quản trị (placeholder) để mở rộng sau.

## Cấu trúc
- server: API Node/Express
- client: React (Vite) + Tailwind + React Router

## Chạy nhanh trên Windows PowerShell
1. Sao chép file `.env.example` trong thư mục `server` thành `.env` và cập nhật `MONGODB_URI` nếu cần (mặc định dùng localhost).
2. Cài đặt phụ thuộc cho cả client và server:
	```powershell
	npm run install:all
	```
3. Chạy song song client và server (dev):
	```powershell
	npm run dev
	```
	- API: http://localhost:5000/api/health
	- Web: http://localhost:5173/

Fonts sử dụng: Playfair Display (tiêu đề), Poppins (nội dung), Great Vibes (logo). Được import qua Google Fonts trong `client/index.html`.

## Triển khai (Render API + Cloudflare Pages)

API (Render):
- Root: `server`
- Build: `npm install`
- Start: `npm start`
- Env: `PORT`, `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, `BCRYPT_ROUNDS`, `CLIENT_URLS`, `CLIENT_ORIGIN_REGEXES`, `CLOUDINARY_*`

Client (Cloudflare Pages):
- Root: `client`
- Build: `npm run build`
- Output: `dist`
- Env: `VITE_API_BASE=https://<render-service>.onrender.com/api`

CORS & CSP:
- Server đã chấp nhận localhost:517x, danh sách CLIENT_URLS, regex cho *.pages.dev/*.workers.dev.
- Client `_headers` có CSP với `connect-src https:`.

