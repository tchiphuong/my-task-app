import { addDays, format, getDay } from "date-fns";

export interface ParsedTaskData {
    title: string;
    description?: string;
    dueDate?: string | null;
    startDate?: string | null;
    priority?: "low" | "medium" | "high";
    category?: string;
    repeat?: "none" | "daily" | "weekdays" | "weekly" | "monthly";
    isDaily?: boolean;
}

/**
 * Bộ giải thuật Smart Local NLP Heuristic Parser chạy 100% tại Client.
 * Nhận diện câu nói tự nhiên tiếng Việt mà không cần phụ thuộc vào server hay API bên ngoài.
 */
export function fallbackParseTask(
    text: string,
    currentDateStr?: string,
    availableCategories: string[] = [],
): ParsedTaskData {
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
        } else if (period === "trưa") {
            if (h < 11) h += 12;
        } else if (period === "sáng") {
            if (h === 12) h = 0;
        }

        if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
            hour = h;
            minute = m;
        }
    }

    // Ghép ngày giờ
    let dueDate: string | null = null;
    if (hasExplicitDate || hour !== null) {
        if (hour !== null) {
            targetDate.setHours(hour, minute, 0, 0);
            dueDate = targetDate.toISOString();
        } else {
            targetDate.setHours(23, 59, 59, 0);
            dueDate = format(targetDate, "yyyy-MM-dd");
        }
    }

    // 5. Làm sạch Title
    let title = text
        .replace(
            /(khẩn cấp|gấp|quan trọng|cháy|ưu tiên cao|ưu tiên thấp|thong thả)/gi,
            "",
        )
        .replace(
            /(mỗi ngày|hàng ngày|hằng ngày|mỗi tuần|hàng tuần|mỗi tháng|ngày thường)/gi,
            "",
        )
        .replace(/(ngày mai|sáng mai|chiều mai|tối mai|mai|ngày mốt)/gi, "")
        .replace(/(hôm nay|tối nay|chiều nay|trưa nay|sáng nay)/gi, "")
        .replace(
            /(thứ hai|thứ 2|thứ ba|thứ 3|thứ tư|thứ 4|thứ năm|thứ 5|thứ sáu|thứ 6|thứ bảy|thứ 7|chủ nhật)/gi,
            "",
        )
        .replace(hourRegex, "")
        .replace(
            /\b(vào lúc|lúc|vào|ngày|hạn|deadline|nhớ|cần|phải|làm)\b/gi,
            "",
        )
        .replace(/\s+/g, " ")
        .trim();

    if (!title) {
        title = text.trim();
    }
    title = title.charAt(0).toUpperCase() + title.slice(1);

    // 6. Nhận diện Category
    let category = "Công việc";
    const matchedCat = availableCategories.find((c) =>
        lower.includes(c.toLowerCase()),
    );

    if (matchedCat) {
        category = matchedCat;
    } else if (
        /(tập|thể dục|gym|chạy bộ|uống nước|ngủ|sức khỏe)/i.test(lower)
    ) {
        category = "Sức khỏe";
    } else if (
        /(học|đọc sách|ôn thi|bài tập|khóa học|tiếng anh)/i.test(lower)
    ) {
        category = "Học tập";
    } else if (/(mua|chợ|dọn dẹp|gia đình|nấu ăn|nhà)/i.test(lower)) {
        category = "Cá nhân";
    } else if (
        /(họp|báo cáo|dự án|khách hàng|code|release|deploy|gặp sếp)/i.test(
            lower,
        )
    ) {
        category = "Công việc";
    } else if (availableCategories.length > 0) {
        category = availableCategories[0];
    }

    return {
        title,
        description: text.trim(),
        dueDate,
        startDate: format(now, "yyyy-MM-dd"),
        priority,
        category,
        repeat,
        isDaily: false,
    };
}

/**
 * Sinh gợi ý công việc thông minh theo thời gian trong ngày và danh mục.
 */
export function generateSmartFallbackIdeas(categories?: string[]): string[] {
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

/**
 * Gọi Gemini REST API với cơ chế tự động thử lại khi gặp lỗi 429 / 503.
 */
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

/**
 * Hàm phân tích công việc chính:
 * 1. Thử gọi Google Gemini AI nếu có cấu hình API Key.
 * 2. Tự động chuyển đổi sang Smart Local NLP Parser nếu không có Key hoặc khi API gặp sự cố.
 */
export async function parseTaskWithAi(
    text: string,
    currentDateStr?: string,
    availableCategories: string[] = [],
): Promise<ParsedTaskData> {
    const trimmed = text.trim();
    if (!trimmed) {
        throw new Error("Vui lòng nhập nội dung công việc cần xử lý");
    }

    const nowStr = currentDateStr || new Date().toISOString();
    const apiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    // Nếu không có API Key, chạy ngay bộ Local NLP Parser tại client
    if (!apiKey || apiKey.trim() === "") {
        return fallbackParseTask(trimmed, nowStr, availableCategories);
    }

    try {
        const categoriesPrompt =
            availableCategories.length > 0
                ? availableCategories.join(", ")
                : "Công việc, Cá nhân, Học tập, Sức khỏe, Gia đình";

        const systemPrompt = `Bạn là một trợ lý thông minh chuyên phân tích và bóc tách công việc từ ngôn ngữ tự nhiên tiếng Việt cho ứng dụng My Task App.
Thời điểm hiện tại của người dùng là: ${nowStr}.
Danh mục người dùng có sẵn: [${categoriesPrompt}].

Nhiệm vụ của bạn là phân tích đoạn văn bản người dùng nhập vào thành JSON theo cấu trúc sau:
{
  "title": string (Tiêu đề công việc ngắn gọn, rõ ràng, không chứa thời gian/độ ưu tiên thừa),
  "description": string (Mô tả chi tiết hoặc giữ nguyên câu nói gốc),
  "dueDate": string hoặc null (Định dạng ISO 8601 YYYY-MM-DDTHH:mm:ss.sssZ nếu có giờ cụ thể, hoặc YYYY-MM-DD nếu chỉ có ngày, tính toán chính xác dựa vào thời điểm hiện tại),
  "startDate": string hoặc null (Ngày bắt đầu, định dạng YYYY-MM-DD, mặc định là ngày hôm nay nếu không có),
  "priority": "low" | "medium" | "high" (Mức độ ưu tiên dựa vào từ ngữ như "khẩn cấp", "gấp", "quan trọng", "từ từ", mặc định "medium"),
  "category": string (Chọn 1 danh mục phù hợp nhất từ danh mục người dùng có sẵn hoặc tự đề xuất 1 danh mục tiếng Việt phù hợp),
  "repeat": "none" | "daily" | "weekdays" | "weekly" | "monthly" (Tần suất lặp lại nếu có từ khóa như "mỗi ngày", "hàng tuần", "ngày thường", mặc định "none"),
  "isDaily": boolean (true nếu là thói quen hàng ngày lặp lại, ngược lại false)
}

Quy tắc bắt buộc:
1. Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ, KHÔNG bọc trong markdown \`\`\`json, KHÔNG kèm văn bản giải thích.
2. Nếu người dùng nói "mai", "ngày mai" -> cộng thêm 1 ngày so với thời điểm hiện tại.
3. Nếu người dùng nói "chiều nay 3h" -> đặt giờ là 15:00:00 của ngày hôm nay.`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

        const response = await fetchGeminiWithRetry(
            geminiUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                {
                                    text: `${systemPrompt}\n\nNội dung công việc cần phân tích:\n"${trimmed}"`,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.1,
                        responseMimeType: "application/json",
                    },
                }),
            },
            2,
            800,
        );

        if (!response.ok) {
            // Khi Gemini trả về lỗi (429 rate limit, 503 overload...), tự động fallback sang Local NLP Parser
            return fallbackParseTask(trimmed, nowStr, availableCategories);
        }

        const data = await response.json();
        const candidateText =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!candidateText) {
            return fallbackParseTask(trimmed, nowStr, availableCategories);
        }

        const cleanedJson = candidateText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();

        const parsed = JSON.parse(cleanedJson) as ParsedTaskData;
        return {
            title: parsed.title || trimmed,
            description: parsed.description || trimmed,
            dueDate: parsed.dueDate || null,
            startDate: parsed.startDate || format(new Date(), "yyyy-MM-dd"),
            priority: parsed.priority || "medium",
            category: parsed.category || "Công việc",
            repeat: parsed.repeat || "none",
            isDaily: parsed.isDaily || false,
        };
    } catch {
        // Có bất kỳ ngoại lệ nào thì fallback ngay lập tức, đảm bảo luôn thành công 100%
        return fallbackParseTask(trimmed, nowStr, availableCategories);
    }
}

/**
 * Hàm tạo gợi ý ý tưởng AI:
 * Gọi Gemini hoặc trả về bộ gợi ý Smart Fallback Ideas.
 */
export async function suggestIdeasWithAi(
    currentDateStr?: string,
    categories?: string[],
): Promise<string[]> {
    const apiKey =
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "") {
        return generateSmartFallbackIdeas(categories);
    }

    const nowStr = currentDateStr || new Date().toISOString();
    const categoryList =
        categories && categories.length > 0
            ? categories.join(", ")
            : "Công việc, Cá nhân, Học tập, Sức khỏe, Gia đình";

    const systemPrompt = `Bạn là trợ lý gợi ý công việc cho ứng dụng My Task App.
Thời điểm hiện tại của người dùng là: ${nowStr}.
Danh mục người dùng quan tâm: [${categoryList}].

Hãy gợi ý đúng 3 công việc thực tế, thông minh và hữu ích mà người dùng nên làm trong ngày hôm nay hoặc sắp tới.
Quy tắc:
1. Mỗi gợi ý nên bao gồm hành động cụ thể và mốc thời gian tự nhiên (ví dụ: "Soạn thảo tài liệu họp trước 10h sáng mai", "Đi bộ 30 phút lúc 6h chiều nay").
2. Chỉ trả về một JSON Array chứa 3 chuỗi string, ví dụ: ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"].
3. KHÔNG bọc trong markdown, KHÔNG kèm văn bản giải thích thừa.`;

    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`;

        const response = await fetchGeminiWithRetry(
            geminiUrl,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [{ text: systemPrompt }],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: "application/json",
                    },
                }),
            },
            1,
            500,
        );

        if (!response.ok) {
            return generateSmartFallbackIdeas(categories);
        }

        const data = await response.json();
        const candidateText =
            data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!candidateText) {
            return generateSmartFallbackIdeas(categories);
        }

        const cleanedJson = candidateText
            .replace(/^```json\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/, "")
            .trim();

        const ideas = JSON.parse(cleanedJson);
        if (Array.isArray(ideas) && ideas.length > 0) {
            return ideas.map(String);
        }
        return generateSmartFallbackIdeas(categories);
    } catch {
        return generateSmartFallbackIdeas(categories);
    }
}
