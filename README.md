# My Task App - Quản Lý Công Việc & Thói Quen Cá Nhân

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![HeroUI](https://img.shields.io/badge/HeroUI-v3-000000?style=for-the-badge&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

Ứng dụng web quản lý công việc và thói quen hàng ngày hiện đại, tập trung vào trải nghiệm người dùng mượt mà, tốc độ phản hồi tức thì và khả năng hỗ trợ đắc lực từ trí tuệ nhân tạo (AI).

---

## 🌟 Tính Năng Nổi Bật

### 1. 🤖 Trợ Lý AI Thêm Việc Thần Tốc (AI Quick Task)
- **Bóc tách ngôn ngữ tự nhiên thông minh**: Nhập câu nói hoặc ghi chú thông thường (ví dụ: *"Mai 9h sáng đi họp tiến độ dự án độ ưu tiên cao"*), hệ thống tự động nhận diện và trích xuất: tiêu đề, mô tả, ngày bắt đầu, hạn chót, độ ưu tiên, danh mục và thẻ tag.
- **Kiến trúc phân tích kép (Dual-Engine)**: Kết hợp mô hình Gemini AI thế hệ mới cùng bộ giải thuật Smart Local NLP Heuristic Parser dự phòng cục bộ, đảm bảo thêm việc thành công 100% ngay cả khi mạng chập chờn hoặc gián đoạn dịch vụ AI.
- **Hiệu ứng AI Glowing Border**: Hiệu ứng viền phát sáng động hiện đại trong suốt quá trình AI phân tích.

### 2. 📋 Quản Lý Công Việc Đa Dạng
- **Theo dõi toàn diện**: Phân loại rõ ràng các đầu việc cần làm, việc đang làm, việc hoàn thành và việc chưa làm xong (quá hạn).
- **Bộ lọc & Tìm kiếm linh hoạt**: Lọc nhanh theo mức độ ưu tiên (Khẩn cấp, Cao, Trung bình, Thấp), theo danh mục công việc, hoặc trạng thái hoàn thành.
- **Thao tác nhanh**: Đánh dấu hoàn thành, sửa đổi thông tin, kéo thả hoặc cập nhật tức thì với độ trễ 0ms (Optimistic Update).

### 3. 🎯 Thói Quen Hàng Ngày (Daily Habits)
- **Theo dõi thói quen**: Quản lý các công việc cần phải hoàn thành đều đặn mỗi ngày.
- **Đếm chuỗi chu kỳ (Streak Counter)**: Khích lệ duy trì thói quen với chuỗi ngày hoàn thành liên tục.
- **Xem lại 7 ngày gần nhất**: Lịch nhỏ trực quan hiển thị trạng thái hoàn thành trong tuần.

### 4. 📊 Báo Cáo & Thống Kê Năng Suất
- **Thống kê tiến độ thời gian thực**: Tổng hợp tỷ lệ hoàn thành công việc và độ kiên trì với thói quen.
- **Báo cáo chu kỳ 1 tháng**: Phân tích biểu đồ năng suất 30 ngày trực quan (sử dụng thư viện Recharts).
- **Xuất dữ liệu đa định dạng**: Hỗ trợ xuất báo cáo chuẩn xác ra file **Excel (.xlsx)** và **PDF (.pdf)**.

### 5. ☁️ Đồng Bộ Đám Mây & Bảo Mật Cá Nhân
- **Đăng nhập an toàn**: Tích hợp Google OAuth và Firebase Authentication.
- **Không gian dữ liệu riêng biệt**: Dữ liệu công việc của mỗi tài khoản được phân vùng và đồng bộ hai chiều theo thời gian thực trên Cloud Firestore.
- **Khả năng hoạt động ngoại tuyến (Offline-first)**: Lưu trữ cục bộ thông qua Zustand Persist giúp ứng dụng luôn phản hồi tức thì ngay cả khi mất kết nối mạng.

### 6. 🎨 Thiết Kế Hiện Đại Chuẩn Mobile-First
- Xây dựng trên nền tảng **HeroUI v3** kết hợp **Tailwind CSS v4** và **Framer Motion**.
- Phong cách Liquid Glassmorphism sang trọng, hỗ trợ chuyển đổi mượt mà giữa Dark Mode và Light Mode.
- Thanh điều hướng thông minh tối ưu riêng cho điện thoại di động, mang lại cảm giác mượt mà như một ứng dụng Native App thực thụ.

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router, Turbopack, React Compiler) |
| **Thư viện UI** | React 19, HeroUI v3 |
| **Định kiểu (Styling)** | Tailwind CSS v4, Framer Motion |
| **Bộ Icon** | Lucide React, Heroicons, Iconify |
| **Quản lý State** | Zustand (kèm Persist Middleware) |
| **Cơ sở dữ liệu & Auth** | Firebase Cloud Firestore, Firebase Authentication |
| **Xử lý AI** | Google Gemini API & Smart Local NLP Parser |
| **Biểu đồ & Báo cáo** | Recharts, SheetJS (xlsx), jsPDF |
| **Đa ngôn ngữ** | i18next, react-i18next (100% chuẩn Tiếng Việt) |

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### Yêu cầu môi trường
- Đã cài đặt **Node.js** (phiên bản 20.x trở lên).
- Trình quản lý gói `npm`.

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` tại thư mục gốc và khai báo thông tin Firebase cùng khóa Gemini API:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Khởi động môi trường phát triển
```bash
npm run dev
```

Mở trình duyệt và truy cập: **`http://localhost:8080`**

### 4. Kiểm tra bản build
```bash
npm run build
```

---

## 📄 Bản Quyền

© 2026 tchiphuong. Bản quyền thuộc về tác giả.
