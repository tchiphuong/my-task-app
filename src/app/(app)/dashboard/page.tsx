"use client";

import { FireIcon } from "@heroicons/react/24/solid";
import {
  Avatar,
  Button,
  Chip,
  ProgressBar,
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
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { AppCard as Card } from "@/components/common/AppCard";
import { PRIORITY_OPTIONS } from "@/constants";
import { Task, useTaskStore } from "@/store/useTaskStore";

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const user = useTaskStore((state) => state.user);
  const account = useTaskStore((state) => state.getCurrentAccount());
  const updateTask = useTaskStore((state) => state.updateTask);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const tasks = account?.tasks || [];
  const streak = account?.streak || { currentStreak: 0, bestStreak: 0 };
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // 1. Phân loại task hôm nay
  const regularTasksToday = tasks.filter(
    (t) => !t.isDaily && t.dueDate === todayStr
  );

  const dailyTasks = tasks.filter((t) => t.isDaily);

  // Tổng số task hoạt động hôm nay (task thông thường đến hạn hôm nay + daily tasks)
  const totalTasksToday = regularTasksToday.length + dailyTasks.length;

  // Task đã hoàn thành hôm nay
  const completedRegularToday = regularTasksToday.filter((t) => t.status === "done").length;
  const completedDailyToday = dailyTasks.filter((t) =>
    t.completedDates?.includes(todayStr)
  ).length;

  const completedTodayCount = completedRegularToday + completedDailyToday;
  const progressPercent = totalTasksToday > 0
    ? Math.round((completedTodayCount / totalTasksToday) * 100)
    : 0;

  // 2. Việc chưa làm xong khẩn cấp (Overdue hoặc Priority High)
  const urgentTasks = tasks.filter((t) => {
    if (t.status === "done") return false;
    if (t.isDaily) return false;

    const isOverdue = t.dueDate && t.dueDate < todayStr;
    const isHighPriority = t.priority === "high";
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
      "Công việc": completedRegular,
      "Thói quen": completedDaily,
    };
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  const getGreetingIcon = () => {
    const hour = new Date().getHours();
    const className = "w-6 h-6 ml-2 text-warning-500 inline-block align-middle";
    if (hour < 12) return <Sun className={className} />;
    if (hour < 18) return <CloudSun className={className} />;
    return <Moon className={className} />;
  };



  const handleQuickComplete = (task: Task) => {
    updateTask(task.id, {
      status: "done",
      completedAt: new Date().toISOString(),
    });
  };

  const getProgressHelperText = () => {
    if (progressPercent === 100) return "Tuyệt vời! Đã hoàn thành 100% mục tiêu!";
    if (totalTasksToday === 0) return "Hôm nay chưa có việc nào hết trơn.";
    return `Cố lên, còn ${totalTasksToday - completedTodayCount} việc nữa.`;
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
              Hôm nay là {format(new Date(), "eeee, 'ngày' dd/MM/yyyy", { locale: vi })}. Bạn đã sẵn sàng chưa nè?
            </p>
          </div>
        </div>
      </div>

      {/* 2. Quick Progress Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Vòng tròn tiến độ hôm nay */}
        <Card className="shadow-sm border border-primary/20 bg-primary/10 backdrop-blur-md relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-primary pointer-events-none" />
          <Card.Content className="flex flex-col gap-2 p-5 justify-between relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary/80 uppercase tracking-wide">Tiến độ hôm nay</span>
              <CheckCircleIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-primary">{progressPercent}%</span>
              <span className="text-xs text-primary/70">
                ({completedTodayCount}/{totalTasksToday} việc)
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar value={progressPercent} color="accent" size="sm">
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            </div>
            <p className="text-2xs text-primary/70 mt-1 italic">
              {getProgressHelperText()}
            </p>
          </Card.Content>
        </Card>

        {/* Thẻ Streak hiện tại */}
        <Card className="shadow-sm border border-warning/20 bg-warning/10 backdrop-blur-md relative overflow-hidden">
          <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-warning pointer-events-none" />
          <Card.Content className="flex flex-col gap-2 p-5 justify-between relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-warning/80 uppercase tracking-wide">Chuỗi Streak</span>
              <FireIcon className="w-5 h-5 text-warning" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-warning">{streak.currentStreak} ngày</span>
            </div>
            <p className="text-xs text-warning/80 leading-normal">
              Kỷ lục tốt nhất của bạn: <span className="font-bold">{streak.bestStreak} ngày</span>.
            </p>
            <p className="text-2xs text-warning/70 italic">
              {streak.currentStreak > 0
                ? "Duy trì phong độ đều đặn nhé!"
                : "Tích hoàn thành thói quen mỗi ngày để bắt đầu chuỗi nhé!"}
            </p>
          </Card.Content>
        </Card>

        {/* Thẻ thống kê chưa hoàn thành */}
        <Card className="shadow-sm border border-danger/20 bg-danger/10 backdrop-blur-md relative overflow-hidden">
          <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full opacity-10 bg-danger pointer-events-none" />
          <Card.Content className="flex flex-col gap-2 p-5 justify-between relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-danger/80 uppercase tracking-wide">Việc chưa xong</span>
              <ClockIcon className="w-5 h-5 text-danger" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-black text-danger">
                {tasks.filter((t) => t.status !== "done").length} việc
              </span>
            </div>
            <p className="text-xs text-danger/80 leading-normal">
              Trong đó có <span className="font-bold">{tasks.filter(t => !t.isDaily && t.status !== "done" && t.dueDate < todayStr).length} việc trễ hạn</span>.
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs h-6 p-0 min-w-0 font-bold self-start mt-1 text-danger hover:text-danger/80"
              onPress={() => router.push("/tasks")}
            >
              Giải quyết ngay
              <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 3. Bảng việc khẩn cấp (Trái - 3 phần) */}
        <Card className="lg:col-span-3 shadow-sm border border-default-100/50 max-h-100">
          <Card.Header className="flex justify-between px-5 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              <h2 className="font-black text-sm tracking-tight">Việc khẩn cấp & trễ hạn</h2>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="text-xs font-bold text-primary"
              onPress={() => router.push("/tasks")}
            >
              Xem tất cả
            </Button>
          </Card.Header>
          <Card.Content className="px-3 py-0">
            <ScrollShadow className="max-h-80 pb-4 px-2">
              {urgentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-default-400">
                  <CheckCircleIcon className="w-12 h-12 text-success-300 mb-2" />
                  <p className="text-sm font-semibold text-success-600">Rất tốt!</p>
                  <p className="text-xs text-default-400 mt-1">Không có việc khẩn cấp nào chưa làm hết.</p>
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
                                  {opt?.name || "Thấp"}
                                </Chip>
                              );
                            })()}
                            <Chip size="sm" variant="soft" color="default">
                              {task.category}
                            </Chip>
                            {task.dueDate && (
                              <span className={`text-2xs flex items-center gap-1 font-medium ${isOverdue ? "text-danger-500 font-bold" : "text-default-400"}`}>
                                <CalendarIcon className="w-3 h-3" />
                                {isOverdue ? `Trễ: ${formattedDate}` : formattedDate}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="font-bold text-xs h-8 min-w-0 px-3 rounded-lg text-success"
                          onPress={() => handleQuickComplete(task)}
                        >
                          Xong
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
        <Card className="lg:col-span-2 bg-default-50/50 dark:bg-default-100/10 backdrop-blur-md border border-default-100/50 dark:border-default-100/10 shadow-sm">
          <Card.Header className="px-5 pt-5 pb-3">
            <h2 className="font-black text-sm tracking-tight">Hiệu suất 7 ngày qua</h2>
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
                  <Bar dataKey="Công việc" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Thói quen" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
