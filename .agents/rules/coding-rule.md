---
name: "Coding Rules & UI Standards"
description: "Quy tắc viết code bắt buộc cho dự án My Task App, đặc biệt nhấn mạnh về Tailwind CSS và giao diện Mobile First."
alwaysOn: true
glob: "**/*.{ts,tsx,js,jsx,css}"
---

# 1. Tailwind CSS Standards (TUYỆT ĐỐI TUÂN THỦ)

- **KHÔNG dùng Arbitrary Values (Giá trị tuỳ tiện)**: Tuyệt đối KHÔNG sử dụng các giá trị cứng tự chế chèn thẳng vào class (ví dụ: `text-[10px]`, `text-[9px]`, `w-[15px]`, `h-[30px]`, `shadow-[...]`). 
- **Chỉ dùng class chuẩn**: Bắt buộc phải sử dụng các class tiện ích (utility classes) tiêu chuẩn mặc định của Tailwind (như `text-xs`, `text-sm`, `w-4`, `h-8`, `shadow-md`, `shadow-2xl`).
- **Spacing & Layout**: Luôn bám sát hệ thống spacing và grid của Tailwind.

# 2. UI/UX & Aesthetics (Giao diện)

- **Mobile Web App First**: Ưu tiên giao diện cho thiết bị di động. Mọi layout phải tương thích tốt với màn hình nhỏ, dễ vuốt chạm.
- **Tận dụng HeroUI v3**: BẮT BUỘC ưu tiên sử dụng tối đa các component có sẵn của `@heroui/react` (như `<Tabs>`, `<Dropdown>`, `<Card>`, `<Avatar>`, `<Chip>`) thay vì tự code thủ công bằng thẻ `div` để đảm bảo chuẩn UI. Đọc kỹ API hoặc code hiện có để import đúng.
- **Màu sắc & Sinh động**: Sử dụng màu sắc theo ngữ cảnh (`primary`, `success`, `warning`, `danger`).
- **Hiệu ứng & Glassmorphism**: Thêm `backdrop-blur-md`, bóng đổ mềm, và các hiệu ứng chuyển đổi mượt mà.
- **Không tự chế class form control**: TUYỆT ĐỐI không tự ý nhét các class Tailwind (như `bg-...`, `border-...`) vào các thẻ control (`Input`, `Select`, `TextField`, `TextArea`...) để đè style mặc định của HeroUI.

# 3. Best Practices & Code Structure

- **Data Mẫu & Fallback (Mock Data)**: Tuyệt đối không để lọt các tính năng "Demo", thông tin tài khoản giả, hoặc hình ảnh placeholder (như Unsplash) cứng ngắc trên code thực tế. Phải dùng UI chuẩn để xử lý trường hợp không có dữ liệu (ví dụ: dùng Avatar Fallback chữ cái đầu).
