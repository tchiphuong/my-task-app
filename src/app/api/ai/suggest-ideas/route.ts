import { NextRequest, NextResponse } from "next/server";

import {
    generateSmartFallbackIdeas,
    getSuggestIdeasSystemPrompt,
} from "@/services/aiService";

interface SuggestIdeasRequestBody {
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
    let requestCategories: string[] | undefined;
    try {
        const body = (await req
            .json()
            .catch(() => ({}))) as SuggestIdeasRequestBody;
        const { currentDate, categories } = body;
        requestCategories = categories;

        const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

        if (!apiKey || apiKey.trim() === "") {
            return NextResponse.json({
                success: true,
                ideas: generateSmartFallbackIdeas(requestCategories),
            });
        }

        const nowStr = currentDate || new Date().toISOString();
        const systemPrompt = getSuggestIdeasSystemPrompt(
            nowStr,
            requestCategories,
        );

        const geminiEndpoint =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "STRING",
                    },
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
            return NextResponse.json({
                success: true,
                ideas: generateSmartFallbackIdeas(requestCategories),
            });
        }

        const data = await res.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidate) {
            return NextResponse.json({
                success: true,
                ideas: generateSmartFallbackIdeas(requestCategories),
            });
        }

        const ideas = JSON.parse(candidate);
        const resolvedIdeas = Array.isArray(ideas)
            ? ideas.slice(0, 3)
            : generateSmartFallbackIdeas(requestCategories);

        return NextResponse.json({ success: true, ideas: resolvedIdeas });
    } catch (err: unknown) {
        console.error("[AI Suggestion Exception - Using Fallback]:", err);
        return NextResponse.json({
            success: true,
            ideas: generateSmartFallbackIdeas(requestCategories),
        });
    }
}
