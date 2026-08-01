# Design System & UI Specifications

**Document ID**: UI-DS-001  
**Project**: My Task App  
**Objective**: Establish a standardized design language, component architecture, and UI/UX guidelines to ensure visual consistency and high-quality user experience across the application.

---

## 1. Color Palette & Contextual Themes
The application utilizes a semantic color system powered by Tailwind CSS. Monochromatic designs are strictly prohibited; colors must be used purposefully to guide user attention and convey state.

* **Primary (Brand Focus)**: Reserved for primary call-to-action (CTA) buttons, active states, and global progress indicators. Conveys focus and primary interactions.
* **Secondary (Supportive)**: Utilized for secondary actions, subtle gradients, and inactive states.
* **Success (Green)**: Indicates successful state transitions, completed tasks, and perfect (100%) habit streaks.
* **Warning (Yellow/Orange)**: Highlights areas requiring attention, such as active streaks (flame icon) or impending deadlines.
* **Danger (Red)**: Exclusively used for destructive actions (e.g., Delete, Logout) and overdue tasks.
* **Default (Grayscale)**: Applied to secondary text, borders, and muted backgrounds to maintain visual hierarchy.

## 2. Typography & Spatial System
* **Utility-First Adherence**: The design strictly relies on predefined Tailwind CSS utility classes (e.g., `text-xs`, `text-sm`, `text-base`, `text-xl`).
* **Absolute Prohibition of Arbitrary Values**: Hardcoded inline styles or arbitrary Tailwind classes (e.g., `text-[9px]`, `text-[10px]`) are strictly forbidden. The minimum allowed typography scale is `text-xs` (12px) to ensure optimal legibility and accessibility across all viewports.

## 3. Component Architecture (HeroUI Integration)
The application leverages **HeroUI** (`@heroui/react`) to accelerate development and ensure accessibility compliance. Custom HTML structures should be avoided when a standard component exists.

* **`<Card>`**: Acts as the primary container for statistics, forms, and lists. Must implement `shadow-sm` and `border-default-100/50` for depth.
* **`<Dropdown>`**: Utilized for complex menus (e.g., User Profile Avatar). Must adhere to the strict nested architecture: `<Dropdown.Popover>` wrapping `<Dropdown.Menu>`.
* **`<Chip>`**: Employed for status badges, categorizations, and priority flags.
* **`<ProgressBar>`**: Visualizes goal completion and real-time task progression.
* **`<Avatar>`**: Standardized representation of user profiles.
* **`<Input>` / `<TextField>`**: Standardized form controls.

## 4. UI/UX Rules & Aesthetic Paradigms
* **Glassmorphism Dynamics**: Core structural elements (Navbar, Header, Notification Center) must implement glassmorphism aesthetics using `bg-background/70 backdrop-blur-md`.
* **Micro-interactions**: All interactive elements (buttons, actionable cards) must incorporate smooth kinetic transitions: `transition-all duration-300 hover:shadow-md hover:-translate-y-1`.
* **Decorative Geometry (Bubbles)**:
  * To mitigate visual fatigue, statistical and summary cards should include subtle geometric background decorations.
  * **Implementation**: The parent container must have `relative overflow-hidden`. The decorative element is absolutely positioned: `<div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full opacity-10 bg-[contextual-color] pointer-events-none"></div>`.
  * **Constraint**: Decorative backgrounds must not stack or conflict with internal component backgrounds to preserve visual clarity.

## 5. Data Architecture & Identity Standard
* **GUID v7 Standard**: Ứng dụng bắt buộc sử dụng định danh **GUID v7 (UUID v7)** cho tất cả các bản ghi dữ liệu (Nhiệm vụ, Lời mời kết nối, Không gian chia sẻ).
* **Time-ordered Sorting**: Bản chất của GUID v7 là chứa thông tin thời gian (timestamp 48-bit) ở đầu chuỗi. Điều này giúp tối ưu hóa hiệu năng truy vấn, lưu trữ và tự động sắp xếp dữ liệu theo thời gian tạo mà không cần tải thêm gánh nặng cho index database.
* **Format**: Chuỗi 36 ký tự phân tách bởi dấu gạch ngang (ví dụ: `018fbcab-3400-7zzz-8zzz-random...`).

