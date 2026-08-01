"use client";

import {
  CalendarDaysIcon,
  CheckIcon,
  FireIcon,
  PlusIcon,
  SparklesIcon,
  TrashIcon
} from "@heroicons/react/24/solid";
import {
  Button,
  Chip,
  Input,
  Label,
  ProgressBar,
  ScrollShadow,
  TextField,
  toast
} from "@heroui/react";
import { format, isSameDay, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import { useEffect, useState } from "react";

import { AppCard as Card } from "@/components/common/AppCard";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { TASK_CATEGORIES } from "@/constants";
import { useTaskStore } from "@/store/useTaskStore";

export default function DailyGoalsPage() {
  const [mounted, setMounted] = useState(false);
  const account = useTaskStore((state) => state.getCurrentAccount());
  const addTask = useTaskStore((state) => state.addTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const toggleDailyTaskDate = useTaskStore((state) => state.toggleDailyTaskDate);

  // Form thêm nhanh thói quen
  const [newDailyTitle, setNewDailyTitle] = useState("");
  const [newDailyCategory, setNewDailyCategory] = useState("Sức khỏe");
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tasks = account?.tasks || [];
  const streak = account?.streak || { currentStreak: 0, bestStreak: 0 };
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Lọc ra các thói quen hàng ngày (Daily tasks)
  const dailyTasks = tasks.filter((t) => t.isDaily);

  // Tính toán tiến độ hôm nay
  const totalDaily = dailyTasks.length;
  const completedDailyToday = dailyTasks.filter((t) =>
    t.completedDates?.includes(todayStr)
  ).length;

  const dailyProgressPercent = totalDaily > 0
    ? Math.round((completedDailyToday / totalDaily) * 100)
    : 0;

  const handleAddDaily = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newDailyTitle.trim()) return;

    addTask({
      title: newDailyTitle,
      description: "Thói quen lặp lại hàng ngày",
      status: "todo",
      priority: "medium",
      category: newDailyCategory,
      dueDate: todayStr,
      isDaily: true,
    });

    toast.success("Đã thêm thói quen mới", {
      description: `Thói quen "${newDailyTitle}" đã được thêm.`,
    });

    setNewDailyTitle("");
  };

  // Chuẩn bị danh sách 7 ngày gần đây để hiển thị Lịch sử Streak
  const last7Days = Array.from({ length: 7 }).map((_, index) => {
    const day = subDays(new Date(), 6 - index);
    const dayStr = format(day, "yyyy-MM-dd");
    let dayName = format(day, "EE", { locale: vi });
    // Rút gọn "Thứ 2" thành "T2" để không rớt dòng trên mobile
    dayName = dayName.replace(/Thứ /i, "T");
    const dateFormatted = format(day, "dd");

    // Ngày đó được coi là hoàn thành mục tiêu ngày khi:
    // Có ít nhất 1 thói quen và tất cả thói quen của ngày đó đều được tích hoàn thành
    const completedCount = dailyTasks.filter((t) =>
      t.completedDates?.includes(dayStr)
    ).length;

    const isDayCompleted = dailyTasks.length > 0 && completedCount === dailyTasks.length;
    const isSomeCompleted = dailyTasks.length > 0 && completedCount > 0 && completedCount < dailyTasks.length;

    return {
      dateStr: dayStr,
      dayName,
      dateFormatted,
      isDayCompleted,
      isSomeCompleted,
      completedCount,
      totalCount: dailyTasks.length,
      isToday: isSameDay(day, new Date()),
    };
  });

  const getProgressMessage = () => {
    if (dailyProgressPercent === 100) {
      return "Thật tuyệt vời! Bạn đã hoàn thành toàn bộ thói quen hôm nay.";
    }
    if (totalDaily === 0) {
      return "Bắt đầu thêm các thói quen hàng ngày phía dưới nhé.";
    }
    return `Còn lại ${totalDaily - completedDailyToday} thói quen cần thực hiện.`;
  };

  const getDayBadgeClass = (day: typeof last7Days[0]) => {
    if (day.isDayCompleted) {
      return "bg-success text-white shadow-sm shadow-success/20";
    }
    if (day.isSomeCompleted) {
      return "bg-warning/20 text-warning-600 dark:text-warning-400";
    }
    return "bg-default-100/50 text-default-500 dark:bg-default-100/10";
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Trang */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-default-900 tracking-tight">Mỗi ngày</h1>
        <p className="text-xs text-default-400 mt-0.5 font-medium">
          Rèn luyện tính kỷ luật bằng việc lặp lại các thói quen tốt mỗi ngày.
        </p>
      </div>

      {/* 2. Thống kê Streak & Tiến độ hôm nay */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chuỗi Streak Card */}
        <Card className="shadow-sm border border-default-100/50 bg-linear-to-br from-warning-500/5 via-background to-warning-500/10 md:col-span-1 relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 h-28 w-28 rounded-full opacity-10 bg-warning-500 pointer-events-none"></div>
          <Card.Content className="p-5 flex flex-col justify-between h-36 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-default-500 uppercase tracking-wide">Kỷ luật liên tục</span>
              <FireIcon className="w-6 h-6 text-warning-500" />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-warning-500">{streak.currentStreak} ngày</span>
            </div>
            <span className="text-xs text-default-400 font-medium">
              Kỷ lục tốt nhất của bạn: <span className="font-bold text-warning-650">{streak.bestStreak} ngày</span>.
            </span>
          </Card.Content>
        </Card>

        {/* Tiến độ hoàn thành thói quen hôm nay */}
        <Card className="shadow-sm border border-default-100/50 md:col-span-2 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-primary-500 pointer-events-none"></div>
          <Card.Content className="p-5 flex flex-col justify-between h-36 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-default-500 uppercase tracking-wide">Tiến độ hôm nay</span>
              <SparklesIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-primary">{dailyProgressPercent}%</span>
              <span className="text-xs text-default-400">
                (Đã xong {completedDailyToday}/{totalDaily} thói quen)
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar value={dailyProgressPercent} color="accent" size="sm">
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            </div>
            <span className="text-xs text-default-400 italic">
              {getProgressMessage()}
            </span>
          </Card.Content>
        </Card>
      </div>

      {/* 3. Lịch sử hoàn thành 7 ngày gần nhất */}
      <Card className="shadow-sm border border-default-100/50">
        <Card.Header className="px-5 pt-5 pb-3">
          <h2 className="font-black text-sm tracking-tight flex items-center gap-1.5">
            <CalendarDaysIcon className="w-4 h-4 text-default-500" />
            Nhìn lại 7 ngày qua
          </h2>
        </Card.Header>
        <Card.Content className="p-4 sm:p-5">
          {/* Mobile: scroll ngang, Desktop: Grid 7 cột */}
          <div className="flex sm:grid sm:grid-cols-7 gap-2 sm:gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {last7Days.map((day) => (
              <div
                key={day.dateStr}
                className={`shrink-0 w-16 sm:w-auto snap-center flex flex-col items-center p-2.5 rounded-xl border ${day.isToday
                  ? "border-primary bg-primary-50/10 dark:bg-primary-950/10"
                  : "border-default-100 dark:border-default-100/10"
                  }`}
              >
                <span className="text-xs text-default-400 font-bold uppercase mb-1">
                  {day.dayName}
                </span>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-200 ${getDayBadgeClass(day)}`}
                >
                  {day.isDayCompleted ? (
                    <CheckIcon className="w-5 h-5 stroke-3" />
                  ) : (
                    day.dateFormatted
                  )}
                </div>
                {day.totalCount > 0 && !day.isDayCompleted && (
                  <span className="text-xs text-default-400 mt-1 font-semibold">
                    {day.completedCount}/{day.totalCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        </Card.Content>
      </Card>

      {/* 4. Form thêm nhanh & Danh sách Thói quen */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Form thêm nhanh thói quen (Trái) */}
        <Card className="lg:col-span-1 shadow-sm border border-default-100/50">
          <Card.Header className="px-5 pt-5 pb-2">
            <h2 className="font-black text-sm tracking-tight">Thêm thói quen mới</h2>
          </Card.Header>
          <Card.Content className="p-5">
            <form onSubmit={handleAddDaily} className="flex flex-col gap-4">
              <TextField
                name="title"
                value={newDailyTitle}
                onChange={setNewDailyTitle}
                isRequired
                className="w-full"
                variant="primary"
              >
                <Label>Tên thói quen</Label>
                <Input placeholder="Ví dụ: Tập gym 30p, Học Anh văn..." />
              </TextField>

              <div className="flex flex-wrap gap-2 py-1">
                <span className="text-xs font-semibold text-default-500 self-center w-full mb-1">Danh mục:</span>
                {TASK_CATEGORIES.filter(cat => cat.code !== "personal").map((cat) => (
                  <Chip
                    key={cat.code}
                    onClick={() => setNewDailyCategory(cat.name)}
                    color={newDailyCategory === cat.name ? "accent" : "default"}
                    variant={newDailyCategory === cat.name ? "primary" : "soft"}
                    className="cursor-pointer font-bold"
                    size="sm"
                  >
                    {cat.name}
                  </Chip>
                ))}
              </div>
              <Button
                type="submit"
                variant="primary"
                className="font-bold text-xs rounded-full mt-1 h-10 w-full"
                isDisabled={!newDailyTitle.trim()}
              >
                <PlusIcon className="w-4 h-4 stroke-2" />
                Thêm vào thói quen ngày
              </Button>
            </form>
          </Card.Content>
        </Card>

        {/* Danh sách Thói quen (Phải) */}
        <Card className="lg:col-span-2 shadow-sm border border-default-100/50 max-h-125">
          <Card.Header className="px-5 pt-5 pb-3">
            <h2 className="font-black text-sm tracking-tight">Danh sách thói quen</h2>
          </Card.Header>
          <Card.Content className="px-3 py-0">
            <ScrollShadow className="max-h-105 pb-4 px-2">
              {dailyTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-default-400">
                  <SparklesIcon className="w-12 h-12 text-primary-300 mb-2" />
                  <p className="text-sm font-semibold">Bắt đầu thói quen tốt!</p>
                  <p className="text-xs text-default-400 mt-1">
                    Nhập tên thói quen bên trái để thêm vào mục tiêu hoàn thành mỗi ngày.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dailyTasks.map((task) => {
                    const isCompletedToday = task.completedDates?.includes(todayStr);
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-200 ${isCompletedToday
                          ? "bg-success-50/20 border-success-100 dark:border-success-950/20"
                          : "bg-default-50/50 border-default-100 dark:border-default-100/10 hover:bg-default-50"
                          }`}
                      >
                        <div className="flex items-center gap-3 w-3/4">
                          <button
                            onClick={() => toggleDailyTaskDate(task.id, todayStr)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all duration-200 ${isCompletedToday
                              ? "bg-success border-success text-white shadow-sm shadow-success/20"
                              : "border-default-300 dark:border-default-700 hover:border-primary"
                              }`}
                          >
                            {isCompletedToday && <CheckIcon className="w-4 h-4 stroke-3" />}
                          </button>

                          <div className="flex flex-col gap-1 overflow-hidden text-left">
                            <span className={`text-xs font-bold truncate leading-tight ${isCompletedToday ? "line-through text-default-400" : "text-default-900"
                              }`}>
                              {task.title}
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Chip size="sm" variant="soft" color="default">
                                {task.category}
                              </Chip>
                              <span className="text-xs text-default-400 font-medium">
                                Đã tích: {task.completedDates?.length || 0} lần
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          isIconOnly
                          size="sm"
                          variant="ghost"
                          className="text-danger-550 hover:text-danger-500"
                          onPress={() => setDeleteTaskId(task.id)}
                        >
                          <TrashIcon className="w-4 h-4 text-default-450 hover:text-danger-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollShadow>
          </Card.Content>
        </Card>
      </div>

      {/* Modal Xác nhận xóa */}
      <ConfirmModal
        isOpen={!!deleteTaskId}
        onOpenChange={(isOpen) => !isOpen && setDeleteTaskId(null)}
        title="Xóa thói quen"
        content="Bạn có chắc chắn muốn xóa thói quen này không? Mọi lịch sử điểm danh của thói quen này cũng sẽ biến mất."
        confirmLabel="Xóa luôn"
        isDanger={true}
        onConfirm={() => {
          if (deleteTaskId) {
            deleteTask(deleteTaskId);
            toast.danger("Đã xóa thói quen");
          }
        }}
      />
    </div>
  );
}
