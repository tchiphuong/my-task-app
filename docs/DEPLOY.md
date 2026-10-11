# Hướng Dẫn Quy Trình Deploy Dự Án (Cloudflare Pages)

Tài liệu này lưu lại toàn bộ đường đi nước bước để deploy ứng dụng **My Task App** lên hệ thống Cloudflare Pages với tên miền chính thức:
👉 **URL Production:** [https://vieccanlam.pages.dev](https://vieccanlam.pages.dev)

---

## 1. Thông Tin Cấu Hình Cơ Bản

- **Nền tảng:** Cloudflare Pages
- **Tên dự án (Project Name):** `vieccanlam`
- **Tên miền mặc định:** `vieccanlam.pages.dev`
- **GitHub Repository:** `https://github.com/tchiphuong/my-task-app.git`
- **Nhánh triển khai chính (Production Branch):** `main`
- **Kiểu ứng dụng:** Next.js Static Export (`output: "export"` cấu hình trong `next.config.ts`)
- **Thư mục xuất bản (Build Output Directory):** `out`
- **Lệnh build:** `npm run build`

---

## 2. Cách 1: Tự Động Triển Khai Qua Git (Khuyên Dùng)

Cloudflare Pages đã được liên kết trực tiếp với GitHub Repository. Mỗi lần anh hoàn thành tính năng hoặc sửa lỗi, chỉ cần thực hiện 3 bước đơn giản:

### Bước 1: Kiểm tra build trước tại máy cục bộ
Trước khi đẩy code lên, nên chạy thử lệnh build để chắc chắn code không bị lỗi cú pháp hay TypeScript:
```bash
npm run build
```
*(Nếu build thành công, thư mục `out/` sẽ được cập nhật trơn tru mà không báo lỗi gì).*

### Bước 2: Commit và Push code lên nhánh `main`
```bash
git add .
git commit -m "feat: cập nhật tính năng mới"
git push origin main
```

### Bước 3: Xem tiến trình deploy tự động
- Cloudflare Pages sẽ tự động bắt tín hiệu webhook từ commit mới trên nhánh `main`.
- Hệ thống CI/CD của Cloudflare sẽ tự động kéo mã nguồn về, cài đặt gói phụ thuộc, chạy `npm run build` và cập nhật trang web trong vòng 1 - 2 phút.
- Anh có thể vào trang quản lý [Cloudflare Dashboard](https://dash.cloudflare.com) > **Workers & Pages** > **vieccanlam** để theo dõi trạng thái build.

---

## 3. Cách 2: Deploy Thủ Công Siêu Tốc Bằng CLI (Wrangler)

Khi cần đưa phiên bản mới lên tức thì mà không muốn chờ đợi hệ thống Git CI/CD của Cloudflare xếp hàng xử lý:

### Dùng lệnh rút gọn (đã cài sẵn trong `package.json`):
```bash
npm run deploy
```

Hoặc chạy trực tiếp lệnh Wrangler:
```bash
# 1. Tạo bản build tĩnh
npm run build

# 2. Đẩy thư mục out trực tiếp lên Cloudflare Pages
npx wrangler pages deploy out --project-name=vieccanlam
```

*Lưu ý:* Máy tính cần được đăng nhập tài khoản Cloudflare từ trước (kiểm tra bằng lệnh `npx wrangler whoami`).

---

## 4. Cấu Hình Cần Nhớ Trên Cloudflare Dashboard

Nếu cần thiết lập lại dự án mới hoặc kiểm tra cấu hình trên Cloudflare:

1. **Framework preset:** Chọn `None` hoặc `Next.js (Static HTML Export)`.
2. **Build command:** `npm run build`
3. **Build output directory:** `out`
4. **Environment Variables (Biến môi trường):**
   Vào **Settings** > **Environment variables**, đảm bảo đã khai báo đầy đủ các biến môi trường như trong file `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `GEMINI_API_KEY`
   - `NODE_VERSION`: `20` (Đảm bảo môi trường build sử dụng Node 20 trở lên để tương thích Next.js 16).

---

## 5. Những Điểm Cần Chú Ý Khi Sửa Đổi Code

- **Giữ nguyên `output: "export"`**: Luôn duy trì dòng `output: "export"` trong file `next.config.ts`. Nếu bỏ dòng này, lệnh build sẽ không tạo ra thư mục tĩnh `out/` và Cloudflare Pages sẽ báo lỗi thiếu thư mục xuất bản.
- **Không dùng tính năng SSR độc quyền**: Do ứng dụng chạy dưới dạng static export, các hàm chạy server động ở runtime (như `getServerSideProps` kiểu cũ hoặc middleware chạy máy chủ Node) không dùng được. Toàn bộ logic API hoặc xác thực được thực hiện ở client và kết nối trực tiếp với Firebase/Gemini.
- **Quy tắc i18n & giao diện**: Giữ nguyên quy tắc không viết cứng chuỗi hiển thị, toàn bộ nhãn UI và thông báo đều lấy qua file `src/i18n/locales/vi/common.json`.
