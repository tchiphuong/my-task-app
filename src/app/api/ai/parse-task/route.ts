import { addDays, format, getDay } from "date-fns";
import { NextRequest, NextResponse } from "next/server";

interface ParseTaskRequestBody {
    text: string;
    currentDate?: string;
    categories?: string[];
}

function fallbackParseTask(
    text: string,
    currentDateStr: string,
    availableCategories: string[] = [],
) {
    const now = currentDateStr ? new Date(currentDateStr) : new Date();
    const lower = text.toLowerCase();

    // 1. Nhận diện Priority
    let priority: "low" | "medium" | "high" = "medium";
    if (/(khẩn cấp|gấp|quan trọng|cháy|cực kỳ|ngay|ưu tiên cao)/i.test(lower)) {
        priority = "high";
    } else if (
        /(thong thả|khi nào rảnh|chill|ưu tiên thấp|từ từ)/i.test(lower)
    ) {
        priority = "low";
    }

    // 2. Nhận diện Repeat
    let repeat: "none" | "daily" | "weekdays" | "weekly" | "monthly" = "none";
    if (/(ngày thường|thứ 2 đến thứ 6|từ thứ hai đến thứ sáu)/i.test(lower)) {
        repeat = "weekdays";
    } else if (
        /(mỗi ngày|hàng ngày|hằng ngày|mỗi sáng|mỗi tối|mỗi chiều)/i.test(lower)
    ) {
        repeat = "daily";
    } else if (/(mỗi tuần|hàng tuần|hằng tuần)/i.test(lower)) {
        repeat = "weekly";
    } else if (/(mỗi tháng|hàng tháng|hằng tháng)/i.test(lower)) {
        repeat = "monthly";
    }

    // 3. Nhận diện Ngày
    let targetDate = new Date(now);
    let hasExplicitDate = false;

    if (/(ngày mai|sáng mai|chiều mai|tối mai|mai)/i.test(lower)) {
        targetDate = addDays(now, 1);
        hasExplicitDate = true;
    } else if (/(ngày mốt|hôm sau)/i.test(lower)) {
        targetDate = addDays(now, 2);
        hasExplicitDate = true;
    } else if (/(hôm nay|tối nay|chiều nay|trưa nay|sáng nay)/i.test(lower)) {
        targetDate = new Date(now);
        hasExplicitDate = true;
    } else {
        const dayMatch = lower.match(
            /(thứ hai|thứ 2|thứ ba|thứ 3|thứ tư|thứ 4|thứ năm|thứ 5|thứ sáu|thứ 6|thứ bảy|thứ 7|chủ nhật)/i,
        );
        if (dayMatch) {
            hasExplicitDate = true;
            const dayMap: Record<string, number> = {
                "chủ nhật": 0,
                "thứ hai": 1,
                "thứ 2": 1,
                "thứ ba": 2,
                "thứ 3": 2,
                "thứ tư": 3,
                "thứ 4": 3,
                "thứ năm": 4,
                "thứ 5": 4,
                "thứ sáu": 5,
                "thứ 6": 5,
                "thứ bảy": 6,
                "thứ 7": 6,
            };
            const targetDay = dayMap[dayMatch[1].toLowerCase()];
            if (targetDay !== undefined) {
                const currentDay = getDay(now);
                let diff = targetDay - currentDay;
                if (diff <= 0) diff += 7;
                targetDate = addDays(now, diff);
            }
        }
    }

    // 4. Nhận diện Giờ phút
    let hour: number | null = null;
    let minute = 0;

    const hourRegex =
        /(\d{1,2})\s*(?:giờ|h)(?:\s*(\d{1,2}))?\s*(sáng|trưa|chiều|tối|đêm)?/i;
    const hourMatch = lower.match(hourRegex);

    if (hourMatch) {
        let h = parseInt(hourMatch[1], 10);
        const m = hourMatch[2] ? parseInt(hourMatch[2], 10) : 0;
        const period = hourMatch[3]?.toLowerCase();

        if (period === "chiều" || period === "tối" || period === "đêm") {
            if (h < 12) h += 12;
        } else if (period === "sáng" && h === 12) {
            h = 0;
        }
        hour = h;
        minute = m;
    } else {
        const timeColon = lower.match(/(\d{1,2}):(\d{2})/);
        if (timeColon) {
            hour = parseInt(timeColon[1], 10);
            minute = parseInt(timeColon[2], 10);
        }
    }

    let dueDate: string | null = null;
    if (hasExplicitDate || hour !== null || repeat !== "none") {
        const d = format(targetDate, "yyyy-MM-dd");
        if (hour !== null) {
            const hStr = String(hour).padStart(2, "0");
            const mStr = String(minute).padStart(2, "0");
            dueDate = `${d}T${hStr}:${mStr}`;
        } else {
            dueDate = d;
        }
    }

    // 5. Nhận diện Category
    let category = "Công việc";
    if (
        /(chạy bộ|thể dục|nước|uống|thiền|ngủ|sức khỏe|khám|gym|bơi)/i.test(
            lower,
        )
    ) {
        category = "Sức khỏe";
    } else if (
        /(học|từ vựng|sách|đọc|bài tập|ôn|chứng chỉ|nghiên cứu|tiếng anh)/i.test(
            lower,
        )
    ) {
        category = "Học tập";
    } else if (
        /(họp|báo cáo|khách hàng|hợp đồng|dự án|email|mã nguồn|doanh thu|kỹ thuật)/i.test(
            lower,
        )
    ) {
        category = "Công việc";
    } else if (
        /(mua|quà|tiền điện|xe|bảo dưỡng|dọn dẹp|nhà|mẹ|sinh nhật)/i.test(lower)
    ) {
        category = "Đời sống";
    }

    if (availableCategories.length > 0) {
        const matched = availableCategories.find(
            (c) => c.toLowerCase() === category.toLowerCase(),
        );
        if (matched) {
            category = matched;
        } else if (
            availableCategories.includes("Công việc") &&
            category === "Công việc"
        ) {
            category = "Công việc";
        } else {
            category = availableCategories[0] || category;
        }
    }

    let title = text.trim();
    title = title.replace(
        /\s*(việc quan trọng|việc khẩn cấp|gấp|nhanh chóng|nha|nghen|nhé)\s*$/i,
        "",
    );
    title = title.charAt(0).toUpperCase() + title.slice(1);

    return {
        title,
        description: "",
        dueDate,
        startDate: null,
        priority,
        category,
        repeat,
        isDaily: false,
    };
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

        const apiKey = process.env.GEMINI_API_KEY;

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

        const categoryList =
            userCategories.length > 0
                ? userCategories.join(", ")
                : "Công việc, Cá nhân, Học tập, Sức khỏe, Gia đình, Tận hưởng";

        const systemPrompt = `Bạn là trợ lý AI thông minh quản lý công việc và thói quen cá nhân.
Thời điểm hiện tại của người dùng là: ${nowStr}.

Hãy dùng khả năng thấu hiểu ngôn ngữ tự nhiên để tự do phân tích, suy luận ngữ cảnh từ bất kỳ câu nhập nào của người dùng thành một công việc hoàn chỉnh:
- title: Tên công việc ngắn gọn, tự nhiên, làm nổi bật hành động cốt lõi (tự động loại bỏ thông tin thời gian, độ ưu tiên hoặc từ ngữ thừa).
- description: Giữ nguyên câu nhập gốc của người dùng hoặc bổ sung mô tả chi tiết nếu có.
- dueDate: Hạn chót công việc (ISO 8601 nếu có giờ cụ thể, hoặc YYYY-MM-DD nếu chỉ có ngày). Tự do suy luận chính xác mốc thời gian từ câu nói dựa trên thời điểm hiện tại. Nếu người dùng không nhắc đến bất kỳ mốc thời gian nào thì để null.
- startDate: Ngày bắt đầu (YYYY-MM-DD), mặc định ngày hiện tại nếu không có mốc riêng.
- priority: Mức độ ưu tiên ("low", "medium", "high") tự suy luận theo tính chất công việc hoặc sắc thái câu nói.
- category: Danh mục phù hợp nhất tự suy luận theo ngữ cảnh thực tế (ưu tiên từ [${categoryList}] hoặc tự đề xuất danh mục tiếng Việt phù hợp).
- repeat: Chu kỳ lặp lại ("none", "daily", "weekdays", "weekly", "monthly") nếu câu nói thể hiện thói quen hoặc việc định kỳ.
- isDaily: true nếu là thói quen thực hiện mỗi ngày, ngược lại false.

Nguyên tắc: Tự do tư duy và suy luận linh hoạt như con người thực thụ với mọi kiểu diễn đạt của người dùng.`;

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
                "x-goog-api-key": apiKey,
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
