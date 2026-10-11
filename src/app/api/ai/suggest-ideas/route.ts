import { NextRequest, NextResponse } from "next/server";

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

function generateSmartFallbackIdeas(categories?: string[]): string[] {
    const hour = new Date().getHours();
    const day = new Date().getDay();

    const timeIdea =
        hour < 12
            ? "Lập danh sách việc ưu tiên và hoàn thành trước 11 giờ trưa nay"
            : hour < 18
              ? "Hoàn tất các đầu việc còn tồn đọng trước 5 giờ chiều nay"
              : "Tổng kết công việc hôm nay và lên kế hoạch cho sáng mai lúc 9 giờ tối";

    const habitIdea =
        day === 5
            ? "Gửi báo cáo tiến độ tuần trước 4 giờ chiều thứ sáu"
            : day === 0 || day === 6
              ? "Dọn dẹp góc làm việc và nghỉ ngơi thư giãn cuối tuần này"
              : "Dành 30 phút rèn luyện kỹ năng chuyên môn vào 8 giờ tối nay";

    const customCategory =
        categories && categories.length > 0 ? categories[0] : "Sức khỏe";
    const categoryIdea =
        customCategory === "Sức khỏe"
            ? "Uống đủ 2 lít nước và tập thể dục 20 phút mỗi ngày thường"
            : `Kiểm tra và cập nhật tiến độ công việc trong danh mục ${customCategory} sáng mai`;

    return [timeIdea, habitIdea, categoryIdea];
}

export async function POST(req: NextRequest) {
    let requestCategories: string[] | undefined;
    try {
        const body = (await req
            .json()
            .catch(() => ({}))) as SuggestIdeasRequestBody;
        const { currentDate, categories } = body;
        requestCategories = categories;

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey || apiKey.trim() === "") {
            console.error(
                "[AI Suggestion Service]: GEMINI_API_KEY is not configured.",
            );
            return NextResponse.json({
                success: true,
                ideas: generateSmartFallbackIdeas(requestCategories),
            });
        }

        const nowStr = currentDate || new Date().toISOString();
        const categoryList =
            categories && categories.length > 0
                ? categories.join(", ")
                : "Công việc, Cá nhân, Học tập, Sức khỏe, Gia đình";

        const systemPrompt = `Bạn là trợ lý gợi ý công việc cho ứng dụng My Task App.
Thời điểm hiện tại của người dùng là: ${nowStr}.
Danh sách danh mục công việc của người dùng gồm: ${categoryList}.

Nhiệm vụ:
Gợi ý chính xác 3 câu mô tả công việc hoặc thói quen thiết thực, đa dạng và phù hợp với thời điểm hiện tại.
Mỗi câu viết bằng tiếng Việt tự nhiên, chứa hành động cụ thể kèm mốc thời gian hoặc chu kỳ lặp lại (ví dụ: hôm nay, sáng mai, thứ sáu tuần này, mỗi ngày lúc mấy giờ, việc khẩn cấp).
Định dạng trả về: Mảng JSON gồm đúng 3 chuỗi ký tự.`;

        const geminiEndpoint =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

        const payload = {
            contents: [
                {
                    role: "user",
                    parts: [
                        {
                            text: systemPrompt,
                        },
                    ],
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
                "x-goog-api-key": apiKey,
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            console.error(
                "[Gemini Suggestion Fallback triggered]:",
                res.status,
                errData,
            );
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
