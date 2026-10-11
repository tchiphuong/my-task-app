"use client";

import { useCallback, useState } from "react";

import {
    ParsedTaskData,
    parseTaskWithAi,
    suggestIdeasWithAi,
} from "@/services/aiService";

export interface UseAiTaskReturn {
    isParsing: boolean;
    isGeneratingIdeas: boolean;
    parsedData: ParsedTaskData | null;
    errorMessage: string | null;
    customAiIdeas: string[] | null;
    parseTask: (
        text: string,
        categories?: string[],
    ) => Promise<ParsedTaskData | null>;
    generateIdeas: (categories?: string[]) => Promise<string[]>;
    resetParsedData: () => void;
    clearError: () => void;
    setErrorMessage: (msg: string | null) => void;
    setCustomAiIdeas: (ideas: string[] | null) => void;
}

/**
 * Custom Hook quản lý toàn bộ trạng thái và logic tương tác với AI Service.
 * Có thể tái sử dụng ở bất kỳ component nào cần thêm việc hoặc gợi ý bằng AI.
 */
export function useAiTask(): UseAiTaskReturn {
    const [isParsing, setIsParsing] = useState(false);
    const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
    const [parsedData, setParsedData] = useState<ParsedTaskData | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [customAiIdeas, setCustomAiIdeas] = useState<string[] | null>(null);

    const resetParsedData = useCallback(() => {
        setParsedData(null);
    }, []);

    const clearError = useCallback(() => {
        setErrorMessage(null);
    }, []);

    const parseTask = useCallback(
        async (
            text: string,
            categories: string[] = [],
        ): Promise<ParsedTaskData | null> => {
            const trimmed = text.trim();
            if (!trimmed) {
                return null;
            }

            setIsParsing(true);
            setErrorMessage(null);
            setParsedData(null);

            try {
                const nowStr = new Date().toISOString();
                const data = await parseTaskWithAi(trimmed, nowStr, categories);
                setParsedData(data);
                return data;
            } catch (err: unknown) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : "Hệ thống tạm thời không thể phân tích nội dung. Bạn vui lòng thử lại sau ít phút.";
                setErrorMessage(msg);
                return null;
            } finally {
                setIsParsing(false);
            }
        },
        [],
    );

    const generateIdeas = useCallback(
        async (categories: string[] = []): Promise<string[]> => {
            setIsGeneratingIdeas(true);
            setErrorMessage(null);

            try {
                const nowStr = new Date().toISOString();
                const ideas = await suggestIdeasWithAi(nowStr, categories);
                setCustomAiIdeas(ideas);
                return ideas;
            } catch (err: unknown) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : "Hệ thống tạm thời chưa thể tạo gợi ý lúc này. Bạn vui lòng thử lại sau.";
                setErrorMessage(msg);
                return [];
            } finally {
                setIsGeneratingIdeas(false);
            }
        },
        [],
    );

    return {
        isParsing,
        isGeneratingIdeas,
        parsedData,
        errorMessage,
        customAiIdeas,
        parseTask,
        generateIdeas,
        resetParsedData,
        clearError,
        setErrorMessage,
        setCustomAiIdeas,
    };
}
