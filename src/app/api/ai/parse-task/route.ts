import { NextRequest, NextResponse } from "next/server";

import {
    fallbackParseTask,
    getParseTaskSystemPrompt,
} from "@/services/aiService";

interface ParseTaskRequestBody {
    text: string;
    currentDate?: string;
    categories?: string[];
}

async function fetchGeminiWithRetry(
    url: string,
    options: RequestInit,
    maxRetries = 2,
    delayMs = 800,
): Promise<Response> {
    let lastResponse: Response | null = null;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const res = await fetch(url, options);
            if (res.ok) {
                return res;
            }
            lastResponse = res;
            if (res.status === 503 || res.status === 429) {
                if (attempt < maxRetries) {
                    await new Promise((resolve) =>
                        setTimeout(resolve, delayMs * (attempt + 1)),
                    );
                    continue;
                }
            } else {
                return res;
            }
        } catch (err: unknown) {
            if (attempt >= maxRetries) {
                throw err;
            }
            await new Promise((resolve) =>
                setTimeout(resolve, delayMs * (attempt + 1)),
            );
        }
    }
    return lastResponse!;
}

export async function POST(req: NextRequest) {
    let text = "";
    let nowStr = new Date().toISOString();
    let userCategories: string[] = [];

    try {
        const body = (await req.json()) as ParseTaskRequestBody;
        text = body.text || "";
        nowStr = body.currentDate || new Date().toISOString();
        userCategories = body.categories || [];

        if (!text || text.trim() === "") {
            return NextResponse.json(
                { error: "Vui lòng nhập nội dung công việc cần xử lý" },
                { status: 400 },
            );
        }

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey || apiKey.trim() === "") {
            const fallbackResult = fallbackParseTask(
                text,
                nowStr,
                userCategories,
            );
            return NextResponse.json({
                success: true,
                data: fallbackResult,
                fallback: true,
            });
        }

        const systemPrompt = getParseTaskSystemPrompt(nowStr, userCategories);

        const geminiEndpoint =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: `${systemPrompt}\n\nNội dung công việc của người dùng:\n"${text}"`,
                        },
                    ],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        title: { type: "STRING" },
                        description: { type: "STRING" },
                        dueDate: { type: "STRING", nullable: true },
                        startDate: { type: "STRING", nullable: true },
                        priority: {
                            type: "STRING",
                            enum: ["low", "medium", "high"],
                        },
                        category: { type: "STRING" },
                        repeat: {
                            type: "STRING",
                            enum: [
                                "none",
                                "daily",
                                "weekdays",
                                "weekly",
                                "monthly",
                            ],
                        },
                        isDaily: { type: "BOOLEAN" },
                    },
                    required: [
                        "title",
                        "priority",
                        "category",
                        "repeat",
                        "isDaily",
                    ],
                },
            },
        };

        const res = await fetchGeminiWithRetry(geminiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey.trim(),
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            console.warn(
                "[Gemini API Quota/Error]: Kích hoạt bộ bóc tách dự phòng thông minh.",
            );
            const fallbackResult = fallbackParseTask(
                text,
                nowStr,
                userCategories,
            );
            return NextResponse.json({
                success: true,
                data: fallbackResult,
                fallback: true,
            });
        }

        const data = await res.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidate) {
            const fallbackResult = fallbackParseTask(
                text,
                nowStr,
                userCategories,
            );
            return NextResponse.json({
                success: true,
                data: fallbackResult,
                fallback: true,
            });
        }

        const parsedResult = JSON.parse(candidate);
        return NextResponse.json({ success: true, data: parsedResult });
    } catch (err: unknown) {
        console.error("[AI Route Exception - Fallback to Local]:", err);
        const fallbackResult = fallbackParseTask(text, nowStr, userCategories);
        return NextResponse.json({
            success: true,
            data: fallbackResult,
            fallback: true,
        });
    }
}
