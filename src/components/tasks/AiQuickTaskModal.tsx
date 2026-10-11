"use client";

import {
    ArrowPathIcon,
    CalendarIcon,
    CheckCircleIcon,
    SparklesIcon,
    TagIcon,
} from "@heroicons/react/24/outline";
import { Button, Chip, Modal } from "@heroui/react";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { AppTextArea as TextArea } from "@/components/common/AppTextArea";
import {
    DATE_FORMATS,
    PRIORITY_OPTIONS,
    REPEAT_TYPE,
    RepeatType,
    TASK_STATUS,
} from "@/constants";
import { useTaskStore } from "@/store/useTaskStore";

type ExampleCategory = "all" | "work" | "habit" | "study" | "personal";

const CATEGORIES_LIST: ExampleCategory[] = [
    "all",
    "work",
    "habit",
    "study",
    "personal",
];

const EXAMPLES_BY_CATEGORY: Record<
    Exclude<ExampleCategory, "all">,
    readonly string[]
> = {
    work: ["ai.work1", "ai.work2", "ai.work3", "ai.work4", "ai.work5"],
    habit: ["ai.habit1", "ai.habit2", "ai.habit3", "ai.habit4", "ai.habit5"],
    study: ["ai.study1", "ai.study2", "ai.study3", "ai.study4", "ai.study5"],
    personal: [
        "ai.personal1",
        "ai.personal2",
        "ai.personal3",
        "ai.personal4",
        "ai.personal5",
    ],
};

function getTimeOfDayKey(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
        return "ai.timeMorning";
    }
    if (hour < 18) {
        return "ai.timeAfternoon";
    }
    return "ai.timeEvening";
}

interface ParsedTaskData {
    title: string;
    description?: string;
    dueDate?: string | null;
    startDate?: string | null;
    priority?: "low" | "medium" | "high";
    category?: string;
    repeat?: "none" | "daily" | "weekdays" | "weekly" | "monthly";
    isDaily?: boolean;
}

interface AiQuickTaskModalProps {
    readonly isOpen: boolean;
    readonly onOpenChange: (open: boolean) => void;
}

export function AiQuickTaskModal({
    isOpen,
    onOpenChange,
}: AiQuickTaskModalProps) {
    const { t } = useTranslation();
    const addTask = useTaskStore((state) => state.addTask);
    const account = useTaskStore((state) => state.getCurrentAccount());

    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedTaskData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const [selectedCategory, setSelectedCategory] =
        useState<ExampleCategory>("all");
    const [exampleSeed, setExampleSeed] = useState(0);
    const [customAiIdeas, setCustomAiIdeas] = useState<string[] | null>(null);

    const currentExamples = useMemo(() => {
        if (customAiIdeas && customAiIdeas.length > 0) {
            return customAiIdeas;
        }

        if (selectedCategory === "all") {
            const timeKey = getTimeOfDayKey();
            const otherItems = [
                ...EXAMPLES_BY_CATEGORY.work,
                ...EXAMPLES_BY_CATEGORY.habit,
                ...EXAMPLES_BY_CATEGORY.study,
                ...EXAMPLES_BY_CATEGORY.personal,
            ];
            const startIndex = (exampleSeed * 2) % otherItems.length;
            const item1 = otherItems[startIndex];
            const item2 = otherItems[(startIndex + 1) % otherItems.length];
            return [t(timeKey), t(item1), t(item2)];
        }

        const pool = EXAMPLES_BY_CATEGORY[selectedCategory];
        const startIndex = (exampleSeed * 3) % pool.length;
        const item1 = pool[startIndex];
        const item2 = pool[(startIndex + 1) % pool.length];
        const item3 = pool[(startIndex + 2) % pool.length];
        return [t(item1), t(item2), t(item3)];
    }, [selectedCategory, exampleSeed, customAiIdeas, t]);

    const refreshSuggestions = () => {
        setCustomAiIdeas(null);
        setExampleSeed((prev) => prev + 1);
    };

    const handleCategoryChange = (cat: ExampleCategory) => {
        setSelectedCategory(cat);
        setCustomAiIdeas(null);
    };

    const handleExampleClick = (example: string) => {
        setInputText(example);
        setParsedData(null);
        setErrorMessage(null);
    };

    const handleGenerateAiIdeas = async () => {
        setIsGeneratingIdeas(true);
        setErrorMessage(null);

        try {
            const userCategories = Array.from(
                new Set(
                    (account?.tasks || [])
                        .map((taskItem) => taskItem.category)
                        .filter(Boolean),
                ),
            );

            const res = await fetch("/api/ai/suggest-ideas", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    currentDate: new Date().toISOString(),
                    categories: userCategories,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Không thể tạo gợi ý");
            }

            if (data.success && Array.isArray(data.ideas)) {
                setCustomAiIdeas(data.ideas);
            }
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Đã có sự cố khi tạo gợi ý từ AI";
            setErrorMessage(msg);
        } finally {
            setIsGeneratingIdeas(false);
        }
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
                        .map((taskItem) => taskItem.category)
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
                    currentDate: new Date().toISOString(),
                    categories,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
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

        let resolvedRepeat: RepeatType | undefined;
        if (parsedData.repeat && parsedData.repeat !== "none") {
            resolvedRepeat = parsedData.repeat as RepeatType;
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
            priority: parsedData.priority || "medium",
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
        setCustomAiIdeas(null);
        onOpenChange(false);
    };

    const matchedPriority = PRIORITY_OPTIONS.find(
        (p) => p.code === parsedData?.priority,
    );
    const priorityColor = matchedPriority ? matchedPriority.color : "default";

    return (
        <Modal>
            <Modal.Backdrop isOpen={isOpen} onOpenChange={handleClose}>
                <Modal.Container>
                    <Modal.Dialog className="sm:max-w-lg">
                        <Modal.CloseTrigger />
                        <Modal.Header>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <SparklesIcon className="w-5 h-5" />
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
                                    onChange={(e) =>
                                        setInputText(e.target.value)
                                    }
                                    rows={3}
                                    className="w-full text-sm"
                                />

                                {/* Gợi ý câu mẫu linh hoạt */}
                                <div className="flex flex-col gap-2 mt-1">
                                    {/* Tiêu đề và các hành động làm mới / AI gợi ý */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold text-default-500">
                                            {t("ai.examplesTitle")}:
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleGenerateAiIdeas}
                                                disabled={isGeneratingIdeas}
                                                className="text-xs text-primary hover:text-primary-600 flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                                            >
                                                {isGeneratingIdeas ? (
                                                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <SparklesIcon className="w-3.5 h-3.5" />
                                                )}
                                                <span>
                                                    {isGeneratingIdeas
                                                        ? t(
                                                              "ai.generatingIdeas",
                                                          )
                                                        : t("ai.generateIdeas")}
                                                </span>
                                            </button>
                                            <span className="text-default-300">
                                                |
                                            </span>
                                            <button
                                                type="button"
                                                onClick={refreshSuggestions}
                                                className="text-xs text-default-600 hover:text-default-900 flex items-center gap-1 cursor-pointer transition-colors"
                                            >
                                                <ArrowPathIcon className="w-3.5 h-3.5" />
                                                {t("ai.refreshExamples")}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Bộ lọc chủ đề */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                                        {CATEGORIES_LIST.map((cat) => {
                                            const isSelected =
                                                selectedCategory === cat;
                                            return (
                                                <Chip
                                                    key={cat}
                                                    size="sm"
                                                    color={
                                                        isSelected
                                                            ? "accent"
                                                            : "default"
                                                    }
                                                    variant={
                                                        isSelected
                                                            ? "primary"
                                                            : "secondary"
                                                    }
                                                    onClick={() =>
                                                        handleCategoryChange(
                                                            cat,
                                                        )
                                                    }
                                                    className="cursor-pointer text-xs"
                                                >
                                                    {t(`ai.categories.${cat}`)}
                                                </Chip>
                                            );
                                        })}
                                    </div>

                                    {/* Danh sách các câu gợi ý linh hoạt */}
                                    <div className="flex flex-col gap-1.5">
                                        {currentExamples.map(
                                            (exampleText, idx) => (
                                                <button
                                                    key={`${exampleText}-${idx}`}
                                                    type="button"
                                                    onClick={() =>
                                                        handleExampleClick(
                                                            exampleText,
                                                        )
                                                    }
                                                    className="text-left text-xs p-2 rounded-xl bg-default-100 hover:bg-default-200 dark:bg-default-100/10 dark:hover:bg-default-100/20 transition-colors text-default-700 dark:text-default-300 cursor-pointer w-full flex items-start gap-1.5"
                                                >
                                                    <span className="text-primary font-bold">
                                                        &bull;
                                                    </span>
                                                    <span className="flex-1">
                                                        {exampleText}
                                                    </span>
                                                </button>
                                            ),
                                        )}
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
                                {isLoading
                                    ? t("ai.parsing")
                                    : t("ai.parseButton")}
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
                                            variant="secondary"
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
                        </Modal.Body>
                    </Modal.Dialog>
                </Modal.Container>
            </Modal.Backdrop>
        </Modal>
    );
}
