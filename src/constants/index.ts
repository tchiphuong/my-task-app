/**
 * Danh sách các danh mục công việc/thói quen mặc định trong hệ thống.
 */
export const TASK_CATEGORIES = [
    { code: "work", name: "Công việc", color: "default" },
    { code: "personal", name: "Cá nhân", color: "default" },
    { code: "education", name: "Học tập", color: "default" },
    { code: "health", name: "Sức khỏe", color: "default" },
    { code: "entertainment", name: "Giải trí", color: "default" },
] as const;

/**
 * Các cấp độ ưu tiên của công việc kèm nhãn màu tương ứng.
 */
export const PRIORITY_OPTIONS = [
    { code: "low", name: "Thấp", color: "default" },
    { code: "medium", name: "Trung bình", color: "warning" },
    { code: "high", name: "Cao", color: "danger" },
] as const;

export const TASK_STATUS = {
    TODO: "todo",
    IN_PROGRESS: "in_progress",
    DONE: "done",
} as const;

export const TASK_PRIORITY = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
} as const;

export const STATUS_OPTIONS = [
    { code: TASK_STATUS.TODO, name: "Cần làm", color: "default" },
    { code: TASK_STATUS.IN_PROGRESS, name: "Đang làm", color: "accent" },
    { code: TASK_STATUS.DONE, name: "Đã xong", color: "success" },
] as const;

/**
 * Bảng màu sắc được dùng chung cho các biểu đồ phân tích (Pie Chart, Bar Chart).
 */
export const CHART_COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
] as const;
