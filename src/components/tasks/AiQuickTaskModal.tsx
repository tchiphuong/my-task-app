"use client";

import {
    CalendarIcon,
    CheckCircleIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    KeyIcon,
    SparklesIcon,
    TagIcon,
} from "@heroicons/react/24/outline";
import { Button, Chip, Modal } from "@heroui/react";
import { format } from "date-fns";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { AppInput as Input } from "@/components/common/AppInput";
import { AppTextArea as TextArea } from "@/components/common/AppTextArea";
import {
    DATE_FORMATS,
    PRIORITY_OPTIONS,
    REPEAT_TYPE,
    RepeatType,
    TASK_STATUS,
} from "@/constants";
import { Task, useTaskStore } from "@/store/useTaskStore";

interface ParsedTaskData {
    title: string;
    description?: string;
    dueDate?: string | null;
    startDate?: string | null;
    priority?: "low" | "medium" | "high" | "urgent";
    category?: string;
    repeat?: "none" | "daily" | "weekly" | "monthly" | "weekday" | "weekdays";
    isDaily?: boolean;
}

interface AiQuickTaskModalProps {
    readonly isOpen: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

const LOCAL_STORAGE_KEY = "my_task_app_gemini_api_key";

export function AiQuickTaskModal({
    isOpen,
    onOpenChange,
}: AiQuickTaskModalProps) {
    const { t } = useTranslation();
    const addTask = useTaskStore((state) => state.addTask);
    const account = useTaskStore((state) => state.getCurrentAccount());

    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedTaskData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    // Cấu hình API Key cá nhân
    const [apiKey, setApiKey] = useState(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(LOCAL_STORAGE_KEY) || "";
        }
        return "";
    });
    const [showKeyConfig, setShowKeyConfig] = useState(false);

    const handleSaveApiKey = (key: string) => {
        setApiKey(key);
        if (typeof window !== "undefined") {
            if (key.trim() === "") {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            } else {
                localStorage.setItem(LOCAL_STORAGE_KEY, key.trim());
            }
        }
    };

    const handleExampleClick = (example: string) => {
        setInputText(example);
        setParsedData(null);
        setErrorMessage(null);
    };

    const handleParseTask = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setErrorMessage(null);
        setParsedData(null);

        try {
            const categories = Array.from(
                new Set(
                    (account?.tasks || [])
                        .map((t) => t.category)
                        .filter(Boolean),
                ),
            );
            const res = await fetch("/api/ai/parse-task", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: inputText,
                    userApiKey: apiKey.trim() || undefined,
                    currentDate: new Date().toISOString(),
                    categories,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                if (data.missingKey) {
                    setShowKeyConfig(true);
                }
                throw new Error(data.error || "Không thể phân tích công việc");
            }

            if (data.success && data.data) {
                setParsedData(data.data);
            } else {
                throw new Error("Dữ liệu nhận diện không hợp lệ");
            }
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Đã xảy ra lỗi phân tích";
            setErrorMessage(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmAdd = () => {
        if (!parsedData) return;

        const isDailyTask = Boolean(
            parsedData.isDaily ||
            (parsedData.repeat && parsedData.repeat !== "none"),
        );

        let resolvedPriority: Task["priority"] = "medium";
        if (
            parsedData.priority === "high" ||
            parsedData.priority === "urgent"
        ) {
            resolvedPriority = "high";
        } else if (parsedData.priority === "low") {
            resolvedPriority = "low";
        }

        let resolvedRepeat: RepeatType | undefined;
        if (parsedData.repeat && parsedData.repeat !== "none") {
            resolvedRepeat =
                parsedData.repeat === "weekday"
                    ? REPEAT_TYPE.WEEKDAYS
                    : (parsedData.repeat as RepeatType);
        } else if (isDailyTask) {
            resolvedRepeat = REPEAT_TYPE.DAILY;
        }

        const fallbackDueDate = format(new Date(), DATE_FORMATS.DATE);
        const resolvedDueDate = parsedData.dueDate || fallbackDueDate;

        addTask({
            title: parsedData.title,
            description: parsedData.description || "",
            dueDate: resolvedDueDate,
            startDate: parsedData.startDate || undefined,
            priority: resolvedPriority,
            category: parsedData.category || "Công việc",
            status: TASK_STATUS.TODO,
            isDaily: isDailyTask,
            repeat: resolvedRepeat,
        });

        setIsSuccess(true);
        setTimeout(() => {
            setIsSuccess(false);
            setParsedData(null);
            setInputText("");
            onOpenChange(false);
        }, 800);
    };

    const handleClose = () => {
        setInputText("");
        setParsedData(null);
        setErrorMessage(null);
        setIsSuccess(false);
        onOpenChange(false);
    };

    const priorityColor =
        PRIORITY_OPTIONS.find((p) => p.code === parsedData?.priority)?.color ||
        "default";

    return (
        <Modal isOpen={isOpen} onOpenChange={handleClose}>
            <Modal.Container>
                <Modal.Dialog className="sm:max-w-lg">
                    <Modal.CloseTrigger />
                    <Modal.Header>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <SparklesIcon className="w-5 h-5 animate-pulse" />
                            </div>
                            <div>
                                <Modal.Heading className="text-base font-bold">
                                    {t("ai.modalTitle")}
                                </Modal.Heading>
                                <p className="text-xs text-default-500 font-normal mt-0.5">
                                    {t("ai.modalDesc")}
                                </p>
                            </div>
                        </div>
                    </Modal.Header>

                    <Modal.Body className="flex flex-col gap-4 py-3">
                        {/* Khu vực nhập mô tả */}
                        <div className="flex flex-col gap-2">
                            <TextArea
                                variant="secondary"
                                placeholder={t("ai.inputPlaceholder")}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                rows={3}
                                className="w-full text-sm"
                            />

                            {/* Gợi ý câu mẫu */}
                            <div className="flex flex-col gap-1.5 mt-1">
                                <span className="text-xs font-semibold text-default-500">
                                    {t("ai.examplesTitle")}:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleExampleClick(t("ai.example1"))
                                        }
                                        className="text-left text-xs px-2.5 py-1 rounded-lg bg-default-100 hover:bg-default-200 transition-colors text-default-700 cursor-pointer"
                                    >
                                        &bull; {t("ai.example1")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleExampleClick(t("ai.example2"))
                                        }
                                        className="text-left text-xs px-2.5 py-1 rounded-lg bg-default-100 hover:bg-default-200 transition-colors text-default-700 cursor-pointer"
                                    >
                                        &bull; {t("ai.example2")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleExampleClick(t("ai.example3"))
                                        }
                                        className="text-left text-xs px-2.5 py-1 rounded-lg bg-default-100 hover:bg-default-200 transition-colors text-default-700 cursor-pointer"
                                    >
                                        &bull; {t("ai.example3")}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Nút hành động phân tích */}
                        <Button
                            variant="primary"
                            onPress={handleParseTask}
                            isDisabled={isLoading || !inputText.trim()}
                            className="w-full font-semibold"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            {isLoading ? t("ai.parsing") : t("ai.parseButton")}
                        </Button>

                        {/* Thông báo lỗi nếu có */}
                        {errorMessage && (
                            <div className="p-3 rounded-xl bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 text-danger text-xs">
                                {errorMessage}
                            </div>
                        )}

                        {/* Kết quả nhận diện (Preview) */}
                        {parsedData && (
                            <div className="p-4 rounded-2xl bg-default-50 dark:bg-default-100/10 border border-default-200 dark:border-default-100/20 flex flex-col gap-3 transition-all">
                                <div className="flex items-center justify-between border-b border-default-200/50 pb-2">
                                    <span className="text-xs font-bold text-default-700 uppercase tracking-wider flex items-center gap-1.5">
                                        <CheckCircleIcon className="w-4 h-4 text-success" />
                                        {t("ai.previewTitle")}
                                    </span>
                                    <Chip
                                        size="sm"
                                        color={priorityColor}
                                        variant="soft"
                                    >
                                        {t(
                                            `tasks.form.priority.${parsedData.priority || "medium"}`,
                                        )}
                                    </Chip>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <h4 className="font-bold text-sm text-default-900">
                                        {parsedData.title}
                                    </h4>
                                    {parsedData.description && (
                                        <p className="text-xs text-default-500">
                                            {parsedData.description}
                                        </p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-default-600">
                                    <div className="flex items-center gap-1.5">
                                        <TagIcon className="w-3.5 h-3.5 text-default-400" />
                                        <span>
                                            {t("ai.previewCategory")}:{" "}
                                            <strong>
                                                {parsedData.category}
                                            </strong>
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <CalendarIcon className="w-3.5 h-3.5 text-default-400" />
                                        <span>
                                            {t("ai.previewDueDate")}:{" "}
                                            <strong>
                                                {parsedData.dueDate ||
                                                    t("tasks.noDueDate")}
                                            </strong>
                                        </span>
                                    </div>
                                    {parsedData.repeat &&
                                        parsedData.repeat !== "none" && (
                                            <div className="col-span-2 flex items-center gap-1.5 text-primary">
                                                <span>
                                                    {t("ai.previewRepeat")}:{" "}
                                                    <strong>
                                                        {t(
                                                            `repeat.${parsedData.repeat}`,
                                                        )}
                                                    </strong>
                                                </span>
                                            </div>
                                        )}
                                </div>

                                <Button
                                    variant="primary"
                                    onPress={handleConfirmAdd}
                                    isDisabled={isSuccess}
                                    className="w-full mt-2 font-bold"
                                >
                                    <CheckCircleIcon className="w-4 h-4" />
                                    {isSuccess
                                        ? t("ai.successAdded")
                                        : t("ai.confirmAdd")}
                                </Button>
                            </div>
                        )}

                        {/* Cài đặt API Key cá nhân */}
                        <div className="pt-2 border-t border-default-100 dark:border-default-100/10">
                            <button
                                type="button"
                                onClick={() => setShowKeyConfig(!showKeyConfig)}
                                className="flex items-center justify-between w-full text-xs text-default-500 hover:text-default-700 font-medium py-1 cursor-pointer"
                            >
                                <span className="flex items-center gap-1.5">
                                    <KeyIcon className="w-3.5 h-3.5" />
                                    {t("ai.configApiKey")}
                                </span>
                                {showKeyConfig ? (
                                    <ChevronUpIcon className="w-3.5 h-3.5" />
                                ) : (
                                    <ChevronDownIcon className="w-3.5 h-3.5" />
                                )}
                            </button>

                            {showKeyConfig && (
                                <div className="flex flex-col gap-2 mt-2 p-3 rounded-xl bg-default-100/50 dark:bg-default-100/10">
                                    <span className="text-xs text-default-500">
                                        {t("ai.apiKeyLabel")}
                                    </span>
                                    <Input
                                        variant="secondary"
                                        type="password"
                                        placeholder={t("ai.apiKeyPlaceholder")}
                                        value={apiKey}
                                        onChange={(e) =>
                                            handleSaveApiKey(e.target.value)
                                        }
                                        className="text-xs"
                                    />
                                    <span className="text-xs text-default-400">
                                        Khóa sẽ được lưu an toàn trên trình
                                        duyệt của bạn để gọi API.
                                    </span>
                                </div>
                            )}
                        </div>
                    </Modal.Body>
                </Modal.Dialog>
            </Modal.Container>
        </Modal>
    );
}
