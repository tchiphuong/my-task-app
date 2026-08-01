# Release Notes: v1.1.0

**Document ID**: RN-1.1.0  
**Release Date**: August 2026  
**Product**: My Task App

### Các tính năng mới & Cải tiến:

1. **Lập kế hoạch chia sẻ (Shared Planning)**:
    - Cho phép gửi lời mời kết nối chia sẻ không gian kế hoạch công việc giữa các thành viên.
    - Hỗ trợ chuyển đổi mượt mà giữa không gian "Cá nhân" và không gian "Chung" trực tiếp trên giao diện của các trang Tasks và Daily.
    - Đồng bộ hóa các thay đổi công việc, trạng thái và tiến độ theo thời gian thực (real-time) thông qua cơ chế lắng nghe sự kiện Firestore.
2. **Định danh chuẩn GUID v7**:
    - Tích hợp bộ sinh ID GUID v7 (UUID v7) tự viết, sắp xếp theo thời gian thực (time-ordered).
    - Áp dụng GUID v7 cho tất cả các loại ID thực thể (Nhiệm vụ, Lời mời, Không gian chia sẻ chung) để nâng cao bảo mật và hiệu năng sắp xếp dữ liệu.
3. **Mock giả lập cho chế độ khách (Offline/Guest)**:
    - Hỗ trợ giả lập kết nối và hiển thị dữ liệu mẫu khi người dùng sử dụng ở chế độ khách (Guest) offline, tạo điều kiện thuận lợi cho việc kiểm thử tự động.

---

# Release Notes: v1.0.0

**Document ID**: RN-1.0.0  
**Release Date**: August 2026  
**Product**: My Task App

This document details the features, technical implementations, and core requirement fulfillments for the initial release (v1.0.0) of My Task App.

---

## I. Core Requirements Fulfillment (5/5 Fulfilled - 100% Completion Rate)

The application successfully delivers 5 out of 5 (100% Completion Rate) of the mandatory core requirements defined in the initial project scope:

1. **Task Management (Kanban)**: Implemented in the **Tasks Module**, featuring a robust Kanban board architecture. Supports full CRUD operations, state transitions (Todo -> In Progress -> Done), priority flagging, and dynamic categorization.
2. **Overdue & Urgent Tracking**: Integrated directly into the **Dashboard Module**. Features dedicated warning widgets for overdue and urgent tasks, coupled with red-border visual alerts for overdue items within the main Task board.
3. **Daily Habit Tracking**: Deployed via the **Daily Module**. Empowers users to configure daily recurring habits, featuring a horizontal 7-day retrospective calendar and a gamified streak-counting algorithm to sustain user motivation.
4. **Real-time Progress Analytics**: A global Progress Bar is embedded in the application header and dashboard, offering instantaneous visual feedback on the daily completion ratio as tasks and habits are executed.
5. **30-Day Performance Reporting**: Delivered through the **Reports Module**. Generates comprehensive statistical charts visualizing task completion rates over a 30-day rolling window, calculates an automated "Productivity Score", and provides CSV data export capabilities.

---

## II. Technical Highlights & UI/UX Innovations

### 1. Architectural UI/UX & Kinetic Animations

- **HeroUI Integration**: The entire visual layer is constructed using enterprise-grade components from HeroUI (Cards, Modals, Buttons, Chips) unified by Tailwind CSS utility classes.
- **Fluid Navigation**: The mobile Bottom Navigation paradigm implements `framer-motion` (`layoutId`) for kinetic slide transitions, delivering a premium, native-app tactile experience.

### 2. Cloud Data Synchronization (Firebase)

- **Cloud Firestore Integration**: All entities (Tasks, Habits, User Profiles) are securely persisted and synchronized in real-time utilizing Firebase Cloud Firestore.
- **Offline-First Resilience**: Engineered with `Zustand` for localized state management, ensuring immediate UI responsiveness (zero latency). Background synchronization protocols guarantee data integrity even when crossing network boundaries or clearing browser cache.

### 3. Responsive Paradigm: "Grid Desktop, Column Mobile"

Strict adherence to a responsive structural paradigm to maximize screen real estate across viewports:

- **Tasks Module**: Renders a multi-column Kanban grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`) on large displays, dynamically reflowing into a single-column layout on mobile.
- **Daily Module**:
    - **7-Day Retrospective**: Implements a horizontal scrolling container (`overflow-x-auto`) with concealed scrollbars and abbreviated labels on mobile viewports. Reverts to a standard 7-column grid on desktop.
    - **Habit Roster**: Maximizes width by utilizing a 2-column grid (`sm:grid-cols-2`) on desktop environments.
- **Dashboard Module**: Urgent task widgets are arranged in a 2-column grid (`sm:grid-cols-2`) on wider screens to prevent spatial waste.

### 4. Safety Protocols & Data Validation

- **Destructive Action Interception**: All critical data deletion sequences (Tasks, Habits) are gated by a mandatory `<ConfirmModal>`, effectively eliminating accidental data loss.

### 5. Repository Optimization

- **Git Hygiene**: Strict `.gitignore` configurations enforce the exclusion of test evidence directories (`docs/evidence/`), maintaining a lightweight and pristine source code repository.
