"use client";

import { FireIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Chip,
  ScrollShadow
} from "@heroui/react";
import { format, isSameDay, parseISO, subDays } from "date-fns";
import { vi } from "date-fns/locale";
import {
  AlertCircle,
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  CloudSun,
  Moon,
  Sun
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { AppCard as Card } from "@/components/common/AppCard";
import { AppProgressBar } from "@/components/common/AppProgressBar";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Mascot } from "@/components/ui/Mascot";
import { MascotEmotion, PRIORITY_OPTIONS, TASK_PRIORITY, TASK_STATUS } from "@/constants";
import { Task, useTaskStore } from "@/store/useTaskStore";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const user = useTaskStore((state) => state.user);
  const account = useTaskStore((state) => state.getCurrentAccount());
  const updateTask = useTaskStore((state) => state.updateTask);

  const tasks = account?.tasks || [];
  const streak = account?.streak || { currentStreak: 0, bestStreak: 0 };
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Số việc trễ deadline thực tế
  const overdueCount = tasks.filter(
    (t) => !t.isDaily && t.status !== TASK_STATUS.DONE && t.dueDate < todayStr
  ).length;

  // 1. Phân loại task hôm nay
  const regularTasksToday = tasks.filter(
    (t) => !t.isDaily && t.dueDate === todayStr
  );

  const dailyTasks = tasks.filter((t) => t.isDaily);

  // Tổng số task hoạt động hôm nay (task thông thường đến hạn hôm nay + daily tasks)
  const totalTasksToday = regularTasksToday.length + dailyTasks.length;

  // Task đã hoàn thành hôm nay
  const completedRegularToday = regularTasksToday.filter((t) => t.status === TASK_STATUS.DONE).length;
  const completedDailyToday = dailyTasks.filter((t) =>
    t.completedDates?.includes(todayStr)
  ).length;
 
  const completedTodayCount = completedRegularToday + completedDailyToday;
  const progressPercent = totalTasksToday > 0
    ? Math.round((completedTodayCount / totalTasksToday) * 100)
    : 0;
 
  // 2. Việc chưa làm xong khẩn cấp (Overdue hoặc Priority High)
  const urgentTasks = tasks.filter((t) => {
    if (t.status === TASK_STATUS.DONE) return false;
    if (t.isDaily) return false;
 
    const isOverdue = t.dueDate && t.dueDate < todayStr;
    const isHighPriority = t.priority === TASK_PRIORITY.HIGH;
    return isOverdue || isHighPriority;
  }).slice(0, 5); // Lấy tối đa 5 việc khẩn cấp nhất

  // 3. Chuẩn bị dữ liệu cho biểu đồ 7 ngày gần đây
  const chartData = Array.from({ length: 7 }).map((_, index) => {
    const day = subDays(new Date(), 6 - index);
    const dayStr = format(day, "yyyy-MM-dd");
    const dayName = format(day, "EE", { locale: vi }); // T2, T3...

    // Đếm số task thông thường hoàn thành vào ngày này
    const completedRegular = tasks.filter((t) => {
      if (t.isDaily || !t.completedAt) return false;
      return isSameDay(parseISO(t.completedAt), day);
    }).length;

    // Đếm số thói quen hoàn thành vào ngày này
    const completedDaily = tasks.filter((t) => {
      if (!t.isDaily) return false;
      return t.completedDates?.includes(dayStr);
    }).length;

    return {
      name: dayName,
      [t("dashboard.chartTaskKey")]: completedRegular,
      [t("dashboard.chartHabitKey")]: completedDaily,
    };
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.greeting.morning");
    if (hour < 18) return t("dashboard.greeting.afternoon");
    return t("dashboard.greeting.evening");
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    const className = "w-6 h-6 ml-2 text-warning-500 inline-block align-middle";
    if (hour < 12) return <Sun className={className} />;
    if (hour < 18) return <CloudSun className={className} />;
    return <Moon className={className} />;
  };

  // Logic xác định biểu cảm và chọn ngẫu nhiên câu thoại của Mascot Bơ Sữa
  const { mascotEmotion, mascotSpeech } = useMemo(() => {
    let key = "inProgress";
    let count = totalTasksToday - completedTodayCount;
    let emotion: MascotEmotion = "neutral";

    if (overdueCount > 0) {
      key = "overdue";
      count = overdueCount;
      emotion = "panicking";
    } else if (totalTasksToday === 0) {
      key = "noTasks";
    } else if (progressPercent === 100) {
      key = "allDone";
      emotion = "happy";
    } else if (progressPercent > 0) {
      emotion = "cheering";
    }

    const quotes = t(`dashboard.mascot.${key}`, { returnObjects: true, count }) as unknown as string[];
    let speech = "";

    if (Array.isArray(quotes) && quotes.length > 0) {
      // Dùng tổng mã ký tự của ngày + số lượng công việc làm seed đặng giữ câu thoại cố định trong ngày, tránh nhảy lung tung khi re-render
      const seed = todayStr.split("").reduce((acc, char) => acc + (char.codePointAt(0) ?? 0), 0) + count;
      const index = seed % quotes.length;
      speech = quotes[index];
    }

    return { mascotEmotion: emotion, mascotSpeech: speech };
  }, [t, todayStr, totalTasksToday, completedTodayCount, overdueCount, progressPercent]);

  const handleQuickComplete = (task: Task) => {
    updateTask(task.id, {
      status: "done",
      completedAt: new Date().toISOString(),
    });
  };

  const getProgressHelperText = () => {
    if (progressPercent === 100) return t("dashboard.progressHelperText1");
    if (totalTasksToday === 0) return t("dashboard.progressHelperText2");
    return t("dashboard.progressHelperText3", { count: totalTasksToday - completedTodayCount });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Welcoming Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg" color="accent">
            <Avatar.Image src={user?.picture} alt={user?.name} />
            <Avatar.Fallback className="text-sm font-bold">{user?.name?.charAt(0) || "U"}</Avatar.Fallback>
          </Avatar>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-default-900 leading-tight flex items-center flex-wrap">
              <span>{getGreeting()}, {user?.name}!</span>
              {getGreetingIcon()}
            </h1>
            <p className="text-xs text-default-500 mt-0.5 font-medium">
              {t("dashboard.readyText", { date: format(new Date(), "eeee, 'ngày' dd/MM/yyyy", { locale: vi }) })}
            </p>
          </div>
        </div>
      </div>

      {/* Bạn đồng hành Mascot Bơ Sữa bong bóng thoại kiểu Duolingo (Tạm ẩn theo yêu cầu) */}
      {false && (
        <div className="flex items-center gap-4 bg-default-100/50 dark:bg-zinc-900/50 border-2 border-b-6 border-default-200/80 rounded-2xl p-4 relative overflow-hidden transition-all duration-300">
          <Mascot emotion={mascotEmotion} size={90} className="shrink-0 transition-transform duration-300 hover:scale-110 active:rotate-12" />
          <div className="flex-1 min-w-0 bg-white dark:bg-zinc-800 border-2 border-default-200 p-3.5 rounded-2xl relative shadow-sm">
            {/* Bong bóng thoại mũi tên bên trái */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-zinc-800 border-l-2 border-b-2 border-default-200 rotate-45" />
            <p className="text-xs md:text-sm font-bold text-default-900 leading-relaxed z-10 relative">
              {mascotSpeech}
            </p>
          </div>
        </div>
      )}

      {/* 2. Quick Progress Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tiến độ hôm nay */}
        <Card className="border-2 border-b-6 border-primary/20 bg-primary/5 dark:bg-primary/10 rounded-2xl shadow-none overflow-hidden relative">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-primary pointer-events-none" />
          <Card.Content className="flex flex-col gap-2 p-5 justify-between relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary/80 uppercase tracking-wide">{t("dashboard.progressToday")}</span>
              <CheckCircleIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-primary">
                <AnimatedNumber value={progressPercent} />%
              </span>
              <span className="text-xs text-primary/70 font-semibold">
                {t("dashboard.tasksCount", { completed: completedTodayCount, total: totalTasksToday })}
              </span>
            </div>
            <div className="mt-3">
              <AppProgressBar value={progressPercent} />
            </div>
            <p className="text-2xs text-primary/70 mt-1.5 italic font-semibold">
              {getProgressHelperText()}
            </p>
          </Card.Content>
        </Card>

        {/* Thẻ Streak hiện tại */}
        <Card className="border-2 border-b-6 border-warning/20 bg-warning/5 dark:bg-warning/10 rounded-2xl shadow-none overflow-hidden relative">
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-warning pointer-events-none" />
          <Card.Content className="flex flex-col gap-2 p-5 justify-between relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-warning/80 uppercase tracking-wide">{t("dashboard.streakTitle")}</span>
              <FireIcon className={`w-5 h-5 transition-all duration-300 ${streak.currentStreak > 0 ? "text-warning animate-bounce" : "text-default-400"}`} />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-black ${streak.currentStreak > 0 ? "text-warning animate-pulse" : "text-default-400"}`}>
                <AnimatedNumber value={streak.currentStreak} /> {t("dashboard.streakDay", { count: "" }).trim()}
              </span>
            </div>
            <p className="text-xs text-warning/80 leading-normal font-semibold">
              {t("dashboard.bestStreak", { count: streak.bestStreak })}
            </p>
            <p className="text-2xs text-warning/70 italic font-semibold">
              {streak.currentStreak > 0
                ? t("dashboard.streakKeep")
                : t("dashboard.streakStart")}
            </p>
          </Card.Content>
        </Card>

        {/* Thẻ thống kê chưa hoàn thành */}
        <Card className="border-2 border-b-6 border-danger/20 bg-danger/5 dark:bg-danger/10 rounded-2xl shadow-none overflow-hidden relative">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-danger pointer-events-none" />
          <Card.Content className="flex flex-col gap-2 p-5 justify-between relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-danger/80 uppercase tracking-wide">{t("dashboard.pendingTasks")}</span>
              <ClockIcon className="w-5 h-5 text-danger" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-danger">
                <AnimatedNumber value={tasks.filter((t) => t.status !== TASK_STATUS.DONE).length} /> {t("dashboard.tasksCountUnit", { count: "" }).trim()}
              </span>
            </div>
            <p className="text-xs text-danger/80 leading-normal font-semibold">
              {t("dashboard.overdueText", { count: tasks.filter(t => !t.isDaily && t.status !== TASK_STATUS.DONE && t.dueDate < todayStr).length })}
            </p>
            <button
              onClick={() => router.push("/tasks")}
              className="text-xs font-bold px-3 py-1.5 rounded-xl border-2 border-b-4 border-danger/30 active:border-b-0 active:translate-y-1 self-start mt-1 bg-white dark:bg-zinc-800 text-danger hover:bg-danger/5 transition-all cursor-pointer flex items-center gap-1"
            >
              {t("dashboard.solveNow")}
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 3. Bảng việc khẩn cấp (Trái - 3 phần) */}
        <Card className="lg:col-span-3 shadow-sm border border-default-100/50 max-h-100">
          <Card.Header className="flex flex-row justify-between items-center">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              <h2 className="font-black text-sm tracking-tight">{t("dashboard.urgentTitle")}</h2>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs font-bold text-primary"
              onPress={() => router.push("/tasks")}
            >
              {t("dashboard.viewAll")}
            </Button>
          </Card.Header>
          <Card.Content className="px-3 py-0">
            <ScrollShadow className="max-h-80 pb-4 px-2">
              {urgentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-default-400">
                  <CheckCircleIcon className="w-12 h-12 text-success-300 mb-2" />
                  <p className="text-sm font-semibold text-success-600">{t("dashboard.urgentNoTasksTitle")}</p>
                  <p className="text-xs text-default-400 mt-1">{t("dashboard.urgentNoTasksDesc")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {urgentTasks.map((task) => {
                    const isOverdue = task.dueDate && task.dueDate < todayStr;
                    const formattedDate = task.dueDate ? format(parseISO(task.dueDate), "dd/MM/yyyy") : "";
                    return (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-default-100 dark:border-default-100/10 bg-default-50/50 hover:bg-default-50 transition-colors"
                      >
                        <div className="flex flex-col gap-1 w-3/4">
                          <span className="text-xs font-bold text-default-900 truncate">
                            {task.title}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {(() => {
                              const opt = PRIORITY_OPTIONS.find(o => o.code === task.priority);
                              return (
                                <Chip size="sm" variant="soft" color={opt?.color || "default"}>
                                  {opt ? t(`tasks.form.priority.${opt.code}`) : t("tasks.form.priority.low")}
                                </Chip>
                              );
                            })()}
                            <Chip size="sm" variant="soft" color="default">
                              {task.category}
                            </Chip>
                            {task.dueDate && (
                              <span className={`text-2xs flex items-center gap-1 font-medium ${isOverdue ? "text-danger-500 font-bold" : "text-default-400"}`}>
                                <CalendarIcon className="w-3 h-3" />
                                {isOverdue ? t("tasks.overdue", { date: formattedDate }) : formattedDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-success"
                          onPress={() => handleQuickComplete(task)}
                        >
                          {t("tasks.done")}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollShadow>
          </Card.Content>
        </Card>

        {/* 4. Biểu đồ hiệu suất 7 ngày qua (Phải - 2 phần) */}
        <Card className="lg:col-span-2">
          <Card.Header className="px-5 pt-5 pb-3">
            <h2 className="font-black text-sm tracking-tight">{t("dashboard.performanceTitle")}</h2>
          </Card.Header>
          <Card.Content className="p-4 flex items-center justify-center">
            <div className="w-full h-70">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="currentColor"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    className="text-default-400"
                  />
                  <YAxis
                    stroke="currentColor"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    className="text-default-400"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "rgba(var(--background), 0.95)",
                      fontSize: "12px"
                    }}
                  />
                  <Bar dataKey={t("dashboard.chartTaskKey")} fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t("dashboard.chartHabitKey")} fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
