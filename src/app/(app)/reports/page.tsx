"use client";

import {
  ArrowDownTrayIcon,
  ChartPieIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";
import { Button, Chip, ListBox, Select, Table } from "@heroui/react";
import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth } from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import * as XLSX from "xlsx";

import { AppCard as Card } from "@/components/common/AppCard";
import { CHART_COLORS, STATUS_OPTIONS, TASK_STATUS } from "@/constants";
import { Task, useTaskStore } from "@/store/useTaskStore";

export default function ReportsPage() {
  const { t } = useTranslation();
  const account = useTaskStore((state) => state.getCurrentAccount());

  // Chọn tháng báo cáo (Định dạng YYYY-MM)
  const currentMonthStr = format(new Date(), "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  const tasks = account?.tasks || [];

  // Tạo danh sách 6 tháng gần nhất để chọn lựa
  const monthOptions = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    return {
      key: format(d, "yyyy-MM"),
      label: `Tháng ${format(d, "MM/yyyy")}`
    };
  });

  // Lọc các task thuộc tháng đã chọn (bao gồm task thông thường và daily tasks đã có tích chọn trong tháng đó)
  const start = startOfMonth(parseISO(`${selectedMonth}-01`));
  const end = endOfMonth(parseISO(`${selectedMonth}-01`));

  const monthlyTasks = tasks.filter((task) => {
    const createdDate = parseISO(task.createdAt);
    const isCreatedInMonth = isWithinInterval(createdDate, { start, end });
    
    const hasDailyInMonth = task.isDaily && task.completedDates?.some(d => {
      const p = parseISO(d);
      return isWithinInterval(p, { start, end });
    });

    return isCreatedInMonth || hasDailyInMonth;
  });

  // Thống kê số lượng
  const totalTasks = monthlyTasks.length;
  
  const completedCount = monthlyTasks.filter(t => t.status === TASK_STATUS.DONE).length;
  const inProgressCount = monthlyTasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
  
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  // Tính số lượng task trễ hạn trong tháng
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const overdueCount = monthlyTasks.filter(t => 
    !t.isDaily && t.status !== TASK_STATUS.DONE && t.dueDate && t.dueDate < todayStr
  ).length;

  // Thống kê theo danh mục (Category)
  const categoryStats: { [name: string]: number } = {};
  monthlyTasks.forEach(t => {
    const cat = t.category || "Khác";
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  
  const pieData = Object.keys(categoryStats).map((name, index) => ({
    name,
    value: categoryStats[name],
    fill: CHART_COLORS[index % CHART_COLORS.length]
  }));

  // Hàm chuyển đổi tiếng Việt có dấu thành không dấu để xuất PDF không lỗi font
  const removeVietnameseTones = (str: string) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replaceAll("đ", "d")
      .replaceAll("Đ", "D");
  };

  const getPriorityLabelNoTone = (priority: Task["priority"]) => {
    return removeVietnameseTones(t(`tasks.form.priority.${priority || "low"}`));
  };

  const getStatusLabelNoTone = (status: Task["status"]) => {
    return removeVietnameseTones(t(`tasks.form.status.${status || "todo"}`));
  };

  const getStatusLabel = (status: Task["status"]) => {
    return t(`tasks.form.status.${status || "todo"}`);
  };

  const getStatusColor = (status: Task["status"]) => {
    return STATUS_OPTIONS.find(o => o.code === status)?.color || "default";
  };

  // 1. Xuất file Excel
  const handleExportExcel = () => {
    if (monthlyTasks.length === 0) return;

    const data = monthlyTasks.map((task) => ({
      [removeVietnameseTones(t("reports.export.title"))]: removeVietnameseTones(task.title),
      [removeVietnameseTones(t("reports.export.type"))]: task.isDaily ? removeVietnameseTones(t("reports.taskTypeDaily")) : removeVietnameseTones(t("reports.taskTypeNormal")),
      [removeVietnameseTones(t("reports.export.category"))]: removeVietnameseTones(task.category),
      [removeVietnameseTones(t("reports.export.priority"))]: getPriorityLabelNoTone(task.priority),
      [removeVietnameseTones(t("reports.export.dueDate"))]: task.isDaily ? removeVietnameseTones(t("reports.everyday")) : task.dueDate,
      [removeVietnameseTones(t("reports.export.status"))]: getStatusLabelNoTone(task.status),
      [removeVietnameseTones(t("reports.export.completedAt"))]: task.completedAt ? format(parseISO(task.completedAt), "dd/MM/yyyy HH:mm") : "",
      [removeVietnameseTones(t("reports.export.createdAt"))]: format(parseISO(task.createdAt), "dd/MM/yyyy")
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks Report");
    XLSX.writeFile(workbook, `Bao_cao_cong_viec_thang_${selectedMonth}.xlsx`);
  };

  // 2. Xuất file PDF
  const handleExportPDF = () => {
    if (monthlyTasks.length === 0) return;

    const doc = new jsPDF();
    
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text(removeVietnameseTones("BAO CAO TIEN DO CONG VIEC THANG " + selectedMonth), 14, 20);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Tong so cong viec: ${totalTasks}`, 14, 30);
    doc.text(`Da hoan thanh: ${completedCount} (${completionRate}%)`, 14, 37);
    doc.text(`Dang thuc hien: ${inProgressCount}`, 14, 44);
    doc.text(`Cong viec tre han: ${overdueCount}`, 14, 51);
    
    const tableData = monthlyTasks.map((task) => [
      removeVietnameseTones(task.title),
      task.isDaily ? removeVietnameseTones(t("reports.taskTypeDaily")) : removeVietnameseTones(t("reports.taskTypeNormal")),
      removeVietnameseTones(task.category),
      getPriorityLabelNoTone(task.priority),
      task.isDaily ? removeVietnameseTones(t("reports.everyday")) : task.dueDate,
      getStatusLabelNoTone(task.status)
    ]);

    autoTable(doc, {
      head: [[
        removeVietnameseTones(t("reports.export.title")),
        removeVietnameseTones(t("reports.export.type")),
        removeVietnameseTones(t("reports.export.category")),
        removeVietnameseTones(t("reports.export.priority")),
        removeVietnameseTones(t("reports.export.dueDate")),
        removeVietnameseTones(t("reports.export.status"))
      ]],
      body: tableData,
      startY: 60,
      theme: "striped",
      styles: { fontSize: 9 }
    });

    doc.save(`Bao_cao_thang_${selectedMonth}.pdf`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Header Trang & Chọn tháng */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary tracking-tight">{t("reports.title")}</h1>
          <p className="text-xs text-default-400 mt-0.5 font-medium">
            {t("reports.desc")}
          </p>
        </div>
        
        <Select
          aria-label={t("reports.selectMonth")}
          value={selectedMonth}
          onChange={(key) => setSelectedMonth(key as string)}
          className="w-44 shrink-0"
        >
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {monthOptions.map((opt) => (
                <ListBox.Item key={opt.key} id={opt.key} textValue={opt.label}>
                  {opt.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </div>

      {/* 2. Thống kê chung bằng thẻ số liệu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/10 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="mb-3 flex items-center justify-between relative z-10">
            <h3 className="text-xs font-bold text-primary-700 dark:text-primary-300 uppercase tracking-wide">{t("reports.overview.totalTasks")}</h3>
            <div className="rounded-xl p-2.5 bg-white/60 dark:bg-primary-500/20 shadow-sm backdrop-blur-sm">
              <ClipboardDocumentListIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
          <p className="mb-1 text-4xl font-black text-primary-800 dark:text-primary-100 relative z-10">
            {totalTasks}
          </p>
          <div className="flex items-center text-xs text-primary-600 dark:text-primary-300 font-medium relative z-10">
            <span>{t("reports.overview.tasksType")}</span>
          </div>
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full opacity-30 dark:opacity-20 bg-linear-to-br from-primary-300 to-primary-500 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full opacity-20 dark:opacity-10 bg-linear-to-tr from-primary-400 to-primary-200 blur-xl pointer-events-none" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-success/20 bg-linear-to-br from-success-50 to-success-100 dark:from-success-900/20 dark:to-success-800/10 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="mb-3 flex items-center justify-between relative z-10">
            <h3 className="text-xs font-bold text-success-700 dark:text-success-300 uppercase tracking-wide">{t("reports.overview.completed")}</h3>
            <div className="rounded-xl p-2.5 bg-white/60 dark:bg-success-500/20 shadow-sm backdrop-blur-sm">
              <CheckCircleIcon className="w-5 h-5 text-success-600 dark:text-success-400" />
            </div>
          </div>
          <p className="mb-1 text-4xl font-black text-success-800 dark:text-success-100 relative z-10">
            {completionRate}%
          </p>
          <div className="flex items-center text-xs text-success-600 dark:text-success-300 font-medium relative z-10">
            <span>{t("reports.overview.completedCountText", { count: completedCount })}</span>
          </div>
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full opacity-30 dark:opacity-20 bg-linear-to-br from-success-300 to-success-500 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full opacity-20 dark:opacity-10 bg-linear-to-tr from-success-400 to-success-200 blur-xl pointer-events-none" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-warning/20 bg-linear-to-br from-warning-50 to-warning-100 dark:from-warning-900/20 dark:to-warning-800/10 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="mb-3 flex items-center justify-between relative z-10">
            <h3 className="text-xs font-bold text-warning-700 dark:text-warning-300 uppercase tracking-wide">{t("reports.overview.doing")}</h3>
            <div className="rounded-xl p-2.5 bg-white/60 dark:bg-warning-500/20 shadow-sm backdrop-blur-sm">
              <ClockIcon className="w-5 h-5 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
          <p className="mb-1 text-4xl font-black text-warning-800 dark:text-warning-100 relative z-10">
            {inProgressCount} <span className="text-xl">{t("dashboard.tasksCountUnit", { count: "" }).replace(/\s?\d+\s?/, "")}</span>
          </p>
          <div className="flex items-center text-xs text-warning-600 dark:text-warning-300 font-medium relative z-10">
            <span>{t("reports.overview.doingDesc")}</span>
          </div>
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full opacity-30 dark:opacity-20 bg-linear-to-br from-warning-300 to-warning-500 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full opacity-20 dark:opacity-10 bg-linear-to-tr from-warning-400 to-warning-200 blur-xl pointer-events-none" />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-danger/20 bg-linear-to-br from-danger-50 to-danger-100 dark:from-danger-900/20 dark:to-danger-800/10 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="mb-3 flex items-center justify-between relative z-10">
            <h3 className="text-xs font-bold text-danger-700 dark:text-danger-300 uppercase tracking-wide">{t("reports.overview.overdue")}</h3>
            <div className="rounded-xl p-2.5 bg-white/60 dark:bg-danger-500/20 shadow-sm backdrop-blur-sm">
              <ExclamationCircleIcon className="w-5 h-5 text-danger-600 dark:text-danger-400" />
            </div>
          </div>
          <p className="mb-1 text-4xl font-black text-danger-800 dark:text-danger-100 relative z-10">
            {overdueCount} <span className="text-xl">{t("dashboard.tasksCountUnit", { count: "" }).replace(/\s?\d+\s?/, "")}</span>
          </p>
          <div className="flex items-center text-xs text-danger-600 dark:text-danger-300 font-medium relative z-10">
            <span>{t("reports.overview.overdueDesc")}</span>
          </div>
          <div className="absolute -top-6 -right-6 h-32 w-32 rounded-full opacity-30 dark:opacity-20 bg-linear-to-br from-danger-300 to-danger-500 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full opacity-20 dark:opacity-10 bg-linear-to-tr from-danger-400 to-danger-200 blur-xl pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* 3. Phân bổ danh mục - Biểu đồ tròn (2 phần) */}
        <Card className="lg:col-span-2 shadow-lg shadow-default-100/50 border border-default-200/50 bg-background/50 backdrop-blur-xl">
          <Card.Header className="px-5 pt-5 pb-3">
            <h2 className="font-black text-sm tracking-tight flex items-center gap-1.5">
              <ChartPieIcon className="w-4 h-4 text-default-500" />
              {t("reports.overview.categoryStats")}
            </h2>
          </Card.Header>
          <Card.Content className="p-4 flex items-center justify-center min-h-65">
            {pieData.length === 0 ? (
              <div className="text-center text-default-400 text-xs">{t("reports.noCategoryData")}</div>
            ) : (
              <div className="w-full h-55">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                       data={pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={50}
                       outerRadius={80}
                       paddingAngle={3}
                       dataKey="value"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: "12px", 
                        border: "1px solid hsl(var(--border))",
                        backgroundColor: "rgba(var(--background), 0.95)",
                        fontSize: "12px"
                      }}
                    />
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* 4. Thống kê chi tiết & Xuất báo cáo (3 phần) */}
        <Card className="lg:col-span-3 shadow-lg shadow-default-100/50 border border-default-200/50 bg-background/50 backdrop-blur-xl">
          <Card.Header className="px-5 pt-5 pb-3 flex flex-row justify-between items-center">
            <h2 className="font-black text-sm tracking-tight flex items-center gap-1.5">
              <DocumentTextIcon className="w-4 h-4 text-default-500" />
              {t("reports.exportSummary")}
            </h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="font-bold text-xs text-primary"
                onClick={handleExportExcel}
                isDisabled={monthlyTasks.length === 0}
              >
                <TableCellsIcon className="w-4 h-4" />
                {t("reports.exportExcel")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="font-bold text-xs text-secondary"
                onClick={handleExportPDF}
                isDisabled={monthlyTasks.length === 0}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {t("reports.exportPdf")}
              </Button>
            </div>
          </Card.Header>
          <Card.Content className="p-0">
            <div className="max-h-65 overflow-y-auto w-full px-5 pb-5">
              {monthlyTasks.length === 0 ? (
                <div className="text-center py-16 text-default-400 text-xs">
                  {t("reports.noTasksThisMonth")}
                </div>
              ) : (
                <Table className="w-full">
                  <Table.ScrollContainer>
                    <Table.Content aria-label="Bảng tóm tắt công việc tháng">
                      <Table.Header>
                        <Table.Column isRowHeader className="text-xs font-bold">{t("reports.table.title")}</Table.Column>
                        <Table.Column className="text-xs font-bold text-center">{t("reports.table.dueDate")}</Table.Column>
                        <Table.Column className="text-xs font-bold text-center">{t("reports.table.status")}</Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {monthlyTasks.map((task) => (
                          <Table.Row key={task.id}>
                            <Table.Cell className="py-2.5">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-bold text-default-900 truncate max-w-45">
                                  {task.title}
                                </span>
                                <span className="text-xs text-default-400">
                                  {task.category} • {task.isDaily ? t("reports.taskTypeDaily") : t("reports.taskTypeNormal")}
                                </span>
                              </div>
                            </Table.Cell>
                            <Table.Cell className="text-center py-2.5">
                              <span className="text-xs text-default-500 font-medium">
                                {task.isDaily ? t("reports.everyday") : task.dueDate}
                              </span>
                            </Table.Cell>
                            <Table.Cell className="text-center py-2.5">
                              <Chip
                                size="sm"
                                variant="soft"
                                color={getStatusColor(task.status)}
                              >
                                {getStatusLabel(task.status)}
                              </Chip>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              )}
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

function subMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() - months);
  return result;
}
