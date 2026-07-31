---
name: task-app-ui
description: Builds or modifies UI components for My Task App using HeroUI v3, following Mobile First, Liquid Glass, and strict Tailwind conventions. Use this when you need to create or edit pages and components for this project.
---

# Task App UI Development Skill

Kỹ năng chuyên biệt để hướng dẫn Agent cách xây dựng giao diện chuẩn mực cho dự án My Task App.

## When to use this skill
- Khi người dùng yêu cầu tạo mới hoặc sửa đổi các component giao diện (Pages, Modals, Navbars).
- Khi cần tinh chỉnh CSS, Layout hoặc thay đổi cấu trúc hiển thị của ứng dụng.

## How to use it
Agent khi thực thi các tác vụ UI trong dự án này bắt buộc phải làm theo các bước và tiêu chuẩn sau:

### 1. Nguyên tắc Mobile Web App First
- Mọi thiết kế phải ưu tiên hiển thị hoàn hảo trên màn hình điện thoại trước.
- Các thanh điều hướng chính phải nằm dưới đáy màn hình (Bottom Navigation) theo phong cách **Floating Dock lơ lửng** của iOS (sử dụng `bottom-6`, `rounded-3xl`, `shadow-2xl`).

### 2. Tiêu chuẩn Tailwind CSS (CẤM Arbitrary Values)
- **Tuyệt đối KHÔNG** sử dụng các class chứa giá trị cứng (như `text-[9px]`, `w-[15px]`, `h-[30px]`). 
- Nếu cần chữ nhỏ, chỉ được phép dùng `text-xs`. Nếu cần bóng đổ, chỉ dùng `shadow-md`, `shadow-2xl`, v.v.

### 3. Tận dụng HeroUI v3 & Liquid Glass
- Mọi component phức tạp (như Tabs, Select, Modal, Dropdown) phải được import từ `@heroui/react` (phiên bản v3).
- Lưu ý API v3 của HeroUI Tabs: Phải dùng cấu trúc `<Tabs.ListContainer>`, `<Tabs.List>`, `<Tabs.Tab>` (không dùng `<Tab>` cũ).
- Các thành phần nổi (như Navbar, Modal, Card) nên có hiệu ứng **Liquid Glass**: Kết hợp `bg-background/70` hoặc `bg-white/10` với `backdrop-blur-2xl`.

### 4. Thiết kế 5 tính năng cốt lõi (Core Requirements)
Ứng dụng xoay quanh 4 luồng chính (gộp từ 5 yêu cầu):
- **Công việc**: Gồm Việc cần làm và Việc dang dở.
- **Mỗi ngày**: Tracking thói quen hàng ngày.
- **Tiến độ**: Báo cáo tổng quan dạng biểu đồ.
- **Báo cáo**: Thống kê số liệu tháng và xuất file.
Luôn đảm bảo UI phản ánh đúng cấu trúc này.
