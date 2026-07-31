# Design System - My Task App

Tài liệu này định nghĩa hệ thống thiết kế (Design System) của My Task App, bao gồm màu sắc, typography, các component chính và quy tắc UI/UX để đảm bảo sự đồng nhất trên toàn bộ ứng dụng.

## 1. Màu Sắc (Colors)
Ứng dụng sử dụng hệ thống màu sắc theo ngữ cảnh, dựa trên các class của TailwindCSS. Tuyệt đối không dùng giao diện trắng đen đơn điệu.

* **Primary (Màu chính)**: Dành cho các nút bấm chính, các thành phần đang active, và thanh tiến độ tổng. Thể hiện sự tập trung và hành động chính.
* **Secondary (Màu phụ)**: Hỗ trợ màu chính trong các gradient hoặc các nút phụ (ví dụ: nút "Đăng nhập" ở trạng thái chưa login).
* **Success (Thành công - Xanh lá)**: Dành cho trạng thái hoàn thành (VD: check xong thói quen, chuỗi 7 ngày đạt 100%).
* **Warning (Cảnh báo - Vàng/Cam)**: Dành cho chuỗi Kỷ luật (Streak) có biểu tượng lửa, thu hút sự chú ý vào thành tích.
* **Danger (Nguy hiểm - Đỏ)**: Dành cho các hành động mang tính phá hủy (VD: xóa thói quen, Đăng xuất).
* **Default (Mặc định - Xám)**: Dành cho text phụ, viền (border) và nền nhạt.

## 2. Typography & Kích Thước (Sizing)
* **KHÔNG DÙNG Arbitrary Values**: Bắt buộc sử dụng các utility class có sẵn của Tailwind (ví dụ: `text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, `text-3xl`).
* Tuyệt đối không dùng các class tự chế như `text-[9px]`, `text-[10px]`. Thay vào đó, dùng `text-xs` (tương đương 12px) để đảm bảo khả năng đọc (readability) tốt nhất trên mọi thiết bị.

## 3. UI Components (HeroUI)
Ứng dụng ưu tiên tận dụng sức mạnh của **HeroUI** (`@heroui/react`) thay vì tự viết lại bằng HTML thuần.
* **`<Card>`**: Bọc nội dung thông tin (Thống kê, Form, Danh sách). Luôn đi kèm `shadow-sm` và `border-default-100/50`.
* **`<Dropdown>`**: Dành cho Menu người dùng (Avatar Profile). Chú ý cấu trúc đúng: `<Dropdown.Popover>` và `<Dropdown.Menu>`.
* **`<Chip>`**: Dành cho danh mục (Category) hoặc trạng thái nhỏ (Badge).
* **`<ProgressBar>`**: Hiển thị tiến độ hoàn thành mục tiêu.
* **`<Avatar>`**: Hiển thị ảnh đại diện người dùng.
* **`<TextField>` / `<Input>`**: Dành cho các form nhập liệu.

## 4. UI/UX Rules & Aesthetics (Thẩm mỹ & Hiệu ứng)
* **Glassmorphism**: Áp dụng hiệu ứng kính mờ cho Navbar/Header (`bg-background/70 backdrop-blur-md sticky top-0 z-40`).
* **Micro-interactions**: Mọi nút bấm, thẻ thông tin có thể click đều phải có transition: `transition-all duration-300 hover:shadow-md hover:-translate-y-1`.
* **Bong bóng trang trí (Decorative Bubbles)**:
  * Để thẻ (Card) bớt khô khan, luôn thêm phần tử trang trí mờ mờ ở góc các thẻ thống kê.
  * Cú pháp mẫu: Đặt `relative overflow-hidden` cho thẻ cha, và chèn thẻ con `<div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full opacity-10 bg-[màu-chủ-đạo] pointer-events-none"></div>`.
  * **Lưu ý**: Tránh lạm dụng để 2 lớp background đè lên nhau gây rối mắt.
