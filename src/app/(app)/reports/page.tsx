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
import {
    endOfMonth,
    format,
    isWithinInterval,
    parseISO,
    startOfMonth,
} from "date-fns";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import * as XLSX from "xlsx";

import { AppCard as Card } from "@/components/common/AppCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import {
    CHART_COLORS,
    DATE_FORMATS,
    STATUS_OPTIONS,
    TASK_STATUS,
} from "@/constants";
import { Task, useTaskStore } from "@/store/useTaskStore";
import { removeVietnameseTones } from "@/utils/string";

export default function ReportsPage() {
    const { t } = useTranslation();
    const account = useTaskStore((state) => state.getCurrentAccount());

    // Chọn tháng báo cáo (Định dạng YYYY-MM)
    const currentMonthStr = format(new Date(), DATE_FORMATS.MONTH);
    const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

    const tasks = account?.tasks || [];

    // Tạo danh sách 6 tháng gần nhất để chọn lựa
    const monthOptions = Array.from({ length: 6 }).map((_, i) => {
        const d = subMonths(new Date(), i);
        return {
            key: format(d, DATE_FORMATS.MONTH),
            label: `Tháng ${format(d, DATE_FORMATS.MONTH_DISPLAY)}`,
        };
    });

    // Lọc các task thuộc tháng đã chọn (bao gồm task thông thường và daily tasks đã có tích chọn trong tháng đó)
    const start = startOfMonth(parseISO(`${selectedMonth}-01`));
    const end = endOfMonth(parseISO(`${selectedMonth}-01`));

    const monthlyTasks = tasks.filter((task) => {
        const createdDate = parseISO(task.createdAt);
        const isCreatedInMonth = isWithinInterval(createdDate, { start, end });

        const hasDailyInMonth =
            task.isDaily &&
            task.completedDates?.some((d) => {
                const p = parseISO(d);
                return isWithinInterval(p, { start, end });
            });

        return isCreatedInMonth || hasDailyInMonth;
    });

    // Thống kê số lượng
    const totalTasks = monthlyTasks.length;

    const completedCount = monthlyTasks.filter(
        (t) => t.status === TASK_STATUS.DONE,
    ).length;
    const inProgressCount = monthlyTasks.filter(
        (t) => t.status === TASK_STATUS.IN_PROGRESS,
    ).length;

    const completionRate =
        totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Tính số lượng task trễ hạn trong tháng
    const todayStr = format(new Date(), DATE_FORMATS.DATE);
    const overdueCount = monthlyTasks.filter(
        (t) =>
            !t.isDaily &&
            t.status !== TASK_STATUS.DONE &&
            t.dueDate &&
            t.dueDate < todayStr,
    ).length;

    // Thống kê theo danh mục (Category)
    const categoryStats: { [name: string]: number } = {};
    monthlyTasks.forEach((task) => {
        const cat = task.category || t("reports.other");
        categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    });

    const pieData = Object.keys(categoryStats).map((name, index) => ({
        name,
        value: categoryStats[name],
        fill: CHART_COLORS[index % CHART_COLORS.length],
    }));

    const getPriorityLabelNoTone = (priority: Task["priority"]) => {
        return removeVietnameseTones(
            t(`tasks.form.priority.${priority || "low"}`),
        );
    };

    const getStatusLabelNoTone = (status: Task["status"]) => {
        return removeVietnameseTones(
            t(`tasks.form.status.${status || "todo"}`),
        );
    };

    const getStatusLabel = (status: Task["status"]) => {
        return t(`tasks.form.status.${status || "todo"}`);
    };

    const getStatusColor = (status: Task["status"]) => {
        return (
            STATUS_OPTIONS.find((o) => o.code === status)?.color || "default"
        );
    };

    // 1. Xuất file Excel
    const handleExportExcel = () => {
        if (monthlyTasks.length === 0) return;

        const data = monthlyTasks.map((task) => ({
            [removeVietnameseTones(t("reports.export.title"))]:
                removeVietnameseTones(task.title),
            [removeVietnameseTones(t("reports.export.type"))]: task.isDaily
                ? removeVietnameseTones(t("reports.taskTypeDaily"))
                : removeVietnameseTones(t("reports.taskTypeNormal")),
            [removeVietnameseTones(t("reports.export.category"))]:
                removeVietnameseTones(task.category),
            [removeVietnameseTones(t("reports.export.priority"))]:
                getPriorityLabelNoTone(task.priority),
            [removeVietnameseTones(t("reports.export.dueDate"))]: task.isDaily
                ? removeVietnameseTones(t("reports.everyday"))
                : task.dueDate,
            [removeVietnameseTones(t("reports.export.status"))]:
                getStatusLabelNoTone(task.status),
            [removeVietnameseTones(t("reports.export.completedAt"))]:
                task.completedAt
                    ? format(
                          parseISO(task.completedAt),
                          DATE_FORMATS.DATETIME_DISPLAY,
                      )
                    : "",
            [removeVietnameseTones(t("reports.export.createdAt"))]: format(
                parseISO(task.createdAt),
                DATE_FORMATS.SHORT_DISPLAY,
            ),
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks Report");
        XLSX.writeFile(
            workbook,
            `Bao_cao_cong_viec_thang_${selectedMonth}.xlsx`,
        );
    };

    // 2. Xuất file PDF
    const handleExportPDF = () => {
        if (monthlyTasks.length === 0) return;

        const doc = new jsPDF();

        doc.setFont("Helvetica", "bold");
        doc.setFontSize(18);
        doc.text(
            removeVietnameseTones(
                "BAO CAO TIEN DO CONG VIEC THANG " + selectedMonth,
            ),
            14,
            20,
        );

        doc.setFont("Helvetica", "normal");
        doc.setFontSize(11);
        doc.text(`Tong so cong viec: ${totalTasks}`, 14, 30);
        doc.text(
            `Da hoan thanh: ${completedCount} (${completionRate}%)`,
            14,
            37,
        );
        doc.text(`Dang thuc hien: ${inProgressCount}`, 14, 44);
        doc.text(`Cong viec tre han: ${overdueCount}`, 14, 51);

        const tableData = monthlyTasks.map((task) => [
            removeVietnameseTones(task.title),
            task.isDaily
                ? removeVietnameseTones(t("reports.taskTypeDaily"))
                : removeVietnameseTones(t("reports.taskTypeNormal")),
            removeVietnameseTones(task.category),
            getPriorityLabelNoTone(task.priority),
            task.isDaily
                ? removeVietnameseTones(t("reports.everyday"))
                : task.dueDate,
            getStatusLabelNoTone(task.status),
        ]);

        autoTable(doc, {
            head: [
                [
                    removeVietnameseTones(t("reports.export.title")),
                    removeVietnameseTones(t("reports.export.type")),
                    removeVietnameseTones(t("reports.export.category")),
                    removeVietnameseTones(t("reports.export.priority")),
                    removeVietnameseTones(t("reports.export.dueDate")),
                    removeVietnameseTones(t("reports.export.status")),
                ],
            ],
            body: tableData,
            startY: 60,
            theme: "striped",
            styles: { fontSize: 9 },
        });

        doc.save(`Bao_cao_thang_${selectedMonth}.pdf`);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* 1. Header Trang & Chọn tháng */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-linear-to-r from-primary to-secondary tracking-tight">
                        {t("reports.title")}
                    </h1>
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
                                <ListBox.Item
                                    key={opt.key}
                                    id={opt.key}
                                    textValue={opt.label}
                                >
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
                {/* Tổng số công việc */}
                <Card className="border-2 border-b-6 border-primary/20 bg-primary/5 dark:bg-primary/10 rounded-2xl shadow-none hover:-translate-y-0.5 transition-all">
                    <Card.Content className="p-5 flex flex-col justify-between h-36 relative z-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-primary/80 uppercase tracking-wide">
                                {t("reports.overview.totalTasks")}
                            </h3>
                            <ClipboardDocumentListIcon className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-3xl font-black text-primary">
                            <AnimatedNumber value={totalTasks} />
                        </p>
                        <span className="text-xs text-primary/70 font-semibold">
                            {t("reports.overview.tasksType")}
                        </span>
                    </Card.Content>
                </Card>

                {/* Tỷ lệ hoàn thành */}
                <Card className="border-2 border-b-6 border-success/20 bg-success/5 dark:bg-success/10 rounded-2xl shadow-none hover:-translate-y-0.5 transition-all">
                    <Card.Content className="p-5 flex flex-col justify-between h-36 relative z-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-success/80 uppercase tracking-wide">
                                {t("reports.overview.completed")}
                            </h3>
                            <CheckCircleIcon className="w-5 h-5 text-success" />
                        </div>
                        <p className="text-3xl font-black text-success">
                            <AnimatedNumber value={completionRate} />%
                        </p>
                        <span className="text-xs text-success/70 font-semibold">
                            {t("reports.overview.completedCountText", {
                                count: completedCount,
                            })}
                        </span>
                    </Card.Content>
                </Card>

                {/* Đang thực hiện */}
                <Card className="border-2 border-b-6 border-warning/20 bg-warning/5 dark:bg-warning/10 rounded-2xl shadow-none hover:-translate-y-0.5 transition-all">
                    <Card.Content className="p-5 flex flex-col justify-between h-36 relative z-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-warning/80 uppercase tracking-wide">
                                {t("reports.overview.doing")}
                            </h3>
                            <ClockIcon className="w-5 h-5 text-warning" />
                        </div>
                        <p className="text-3xl font-black text-warning">
                            <AnimatedNumber value={inProgressCount} />
                        </p>
                        <span className="text-xs text-warning/70 font-semibold">
                            {t("reports.overview.doingDesc")}
                        </span>
                    </Card.Content>
                </Card>

                {/* Việc trễ hạn */}
                <Card className="border-2 border-b-6 border-danger/20 bg-danger/5 dark:bg-danger/10 rounded-2xl shadow-none hover:-translate-y-0.5 transition-all">
                    <Card.Content className="p-5 flex flex-col justify-between h-36 relative z-10">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-danger/80 uppercase tracking-wide">
                                {t("reports.overview.overdue")}
                            </h3>
                            <ExclamationCircleIcon className="w-5 h-5 text-danger" />
                        </div>
                        <p className="text-3xl font-black text-danger">
                            <AnimatedNumber value={overdueCount} />
                        </p>
                        <span className="text-xs text-danger/70 font-semibold">
                            {t("reports.overview.overdueDesc")}
                        </span>
                    </Card.Content>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* 3. Phân bổ danh mục - Biểu đồ tròn (2 phần) */}
                <Card className="lg:col-span-2">
                    <Card.Header className="px-5 pt-5 pb-3">
                        <h2 className="font-black text-sm tracking-tight flex items-center gap-1.5">
                            <ChartPieIcon className="w-4 h-4 text-default-500" />
                            {t("reports.overview.categoryStats")}
                        </h2>
                    </Card.Header>
                    <Card.Content className="p-4 flex items-center justify-center min-h-65">
                        {pieData.length === 0 ? (
                            <div className="text-center text-default-400 text-xs">
                                {t("reports.noCategoryData")}
                            </div>
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
                                                backgroundColor:
                                                    "rgba(var(--background), 0.95)",
                                                fontSize: "12px",
                                            }}
                                        />
                                        <Legend
                                            iconSize={8}
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: "11px" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </Card.Content>
                </Card>

                {/* 4. Thống kê chi tiết & Xuất báo cáo (3 phần) */}
                <Card className="lg:col-span-3">
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
                                                <Table.Column
                                                    isRowHeader
                                                    className="text-xs font-bold"
                                                >
                                                    {t("reports.table.title")}
                                                </Table.Column>
                                                <Table.Column className="text-xs font-bold text-center">
                                                    {t("reports.table.dueDate")}
                                                </Table.Column>
                                                <Table.Column className="text-xs font-bold text-center">
                                                    {t("reports.table.status")}
                                                </Table.Column>
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
                                                                    {
                                                                        task.category
                                                                    }{" "}
                                                                    •{" "}
                                                                    {task.isDaily
                                                                        ? t(
                                                                              "reports.taskTypeDaily",
                                                                          )
                                                                        : t(
                                                                              "reports.taskTypeNormal",
                                                                          )}
                                                                </span>
                                                            </div>
                                                        </Table.Cell>
                                                        <Table.Cell className="text-center py-2.5">
                                                            <span className="text-xs text-default-500 font-medium">
                                                                {task.isDaily
                                                                    ? t(
                                                                          "reports.everyday",
                                                                      )
                                                                    : task.dueDate}
                                                            </span>
                                                        </Table.Cell>
                                                        <Table.Cell className="text-center py-2.5">
                                                            <Chip
                                                                size="sm"
                                                                variant="soft"
                                                                color={getStatusColor(
                                                                    task.status,
                                                                )}
                                                            >
                                                                {getStatusLabel(
                                                                    task.status,
                                                                )}
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
