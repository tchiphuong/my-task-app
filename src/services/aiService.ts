import { format } from "date-fns";

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
 * Trả về dữ liệu công việc cơ bản khi không qua AI phân tích,
 * không can thiệp hay kiểm tra thủ công bằng regex cứng nhắc.
 */
export function fallbackParseTask(
    text: string,
    currentDateStr?: string,
    availableCategories: string[] = [],
): ParsedTaskData {
    const now = currentDateStr ? new Date(currentDateStr) : new Date();
    const cleanText = text.trim();

    return {
        title: cleanText,
        description: cleanText,
        dueDate: null,
        startDate: format(now, "yyyy-MM-dd"),
        priority: "medium",
        category: availableCategories[0] || "Công việc",
        repeat: "none",
        isDaily: false,
    };
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
 * Prompt chuẩn phân tích công việc tự nhiên dùng chung cho cả Client Service và Server Route.
 */
export function getParseTaskSystemPrompt(
    nowStr: string,
    categories?: string[],
): string {
    const categoriesPrompt =
        categories && categories.length > 0
            ? categories.join(", ")
            : "Công việc, Cá nhân, Học tập, Sức khỏe, Gia đình";

    return `Bạn là trợ lý AI thông minh quản lý công việc và thói quen cá nhân.
Thời điểm hiện tại của người dùng là: ${nowStr}.
Danh mục người dùng có sẵn: [${categoriesPrompt}].

Hãy dùng khả năng thấu hiểu ngôn ngữ tự nhiên để tự do phân tích, suy luận ngữ cảnh từ bất kỳ câu nhập nào của người dùng thành một công việc hoàn chỉnh:

Cấu trúc JSON đầu ra:
{
  "title": string, // Tên công việc ngắn gọn, tự nhiên, làm nổi bật hành động cốt lõi (tự động loại bỏ thông tin thời gian, độ ưu tiên hoặc từ ngữ thừa)
  "description": string, // Nội dung chi tiết hoặc giữ nguyên câu nhập gốc của người dùng
  "dueDate": string | null, // Hạn chót công việc: định dạng ISO 8601 (nếu có giờ cụ thể) hoặc YYYY-MM-DD (nếu chỉ có ngày). Tự do suy luận chính xác mốc thời gian từ câu nói dựa trên thời điểm hiện tại. Nếu người dùng không nhắc đến bất kỳ mốc thời gian nào thì để null
  "startDate": string | null, // Ngày bắt đầu (YYYY-MM-DD), mặc định ngày hiện tại nếu không có mốc bắt đầu riêng
  "priority": "low" | "medium" | "high", // Mức độ ưu tiên tự suy luận theo tính chất công việc hoặc sắc thái câu nói (mặc định "medium")
  "category": string, // Danh mục công việc phù hợp nhất tự suy luận theo ngữ cảnh thực tế (ưu tiên từ danh mục có sẵn nếu phù hợp)
  "repeat": "none" | "daily" | "weekdays" | "weekly" | "monthly", // Chu kỳ lặp lại nếu câu nói thể hiện thói quen hoặc việc định kỳ (mặc định "none")
  "isDaily": boolean // true nếu là thói quen thực hiện mỗi ngày, ngược lại false
}

Nguyên tắc:
- Hãy tự do tư duy và suy luận linh hoạt như một con người thực thụ, người dùng có thể nhập bất kỳ cú pháp nào (viết tắt, tiếng lóng, ngày tháng bất kỳ kiểu nào, không dấu, có dấu, v.v.).
- Chỉ trả về DUY NHẤT một chuỗi JSON hợp lệ, KHÔNG bọc trong markdown, KHÔNG kèm văn bản giải thích.`;
}

/**
 * Prompt chuẩn gợi ý ý tưởng công việc dùng chung cho cả Client Service và Server Route.
 */
export function getSuggestIdeasSystemPrompt(
    nowStr: string,
    categories?: string[],
): string {
    const categoryList =
        categories && categories.length > 0
            ? categories.join(", ")
            : "Công việc, Cá nhân, Học tập, Sức khỏe, Gia đình";

    return `Bạn là trợ lý gợi ý công việc cho ứng dụng My Task App.
Thời điểm hiện tại của người dùng là: ${nowStr}.
Danh mục người dùng quan tâm: [${categoryList}].

Hãy gợi ý đúng 3 công việc thực tế, thông minh và hữu ích mà người dùng nên làm trong ngày hôm nay hoặc sắp tới.
Quy tắc:
1. Mỗi gợi ý nên bao gồm hành động cụ thể và mốc thời gian tự nhiên (ví dụ: "Soạn thảo tài liệu họp trước 10h sáng mai", "Đi bộ 30 phút lúc 6h chiều nay").
2. Chỉ trả về một JSON Array chứa 3 chuỗi string, ví dụ: ["Gợi ý 1", "Gợi ý 2", "Gợi ý 3"].
3. KHÔNG bọc trong markdown, KHÔNG kèm văn bản giải thích thừa.`;
}

const GEMINI_MODEL = "gemini-flash-latest";

/**
 * Hàm phân tích công việc chính bằng AI.
 */
export async function parseTaskWithAi(
    text: string,
    currentDateStr?: string,
    availableCategories: string[] = [],
): Promise<ParsedTaskData> {
    const trimmed = text.trim();
    if (!trimmed) {
        throw new Error("Bạn vui lòng nhập nội dung công việc cần xử lý.");
    }

    const nowStr = currentDateStr || new Date().toISOString();
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    // Ghi log kỹ thuật nội bộ nếu thiếu key, không để lộ thông tin biến môi trường cho người dùng cuối
    if (!apiKey || apiKey.trim() === "") {
        console.warn("[AI Service] Thiếu cấu hình NEXT_PUBLIC_GEMINI_API_KEY");
        throw new Error(
            "Dịch vụ hỗ trợ thông minh hiện chưa sẵn sàng. Bạn vui lòng thử lại sau.",
        );
    }

    const systemPrompt = getParseTaskSystemPrompt(nowStr, availableCategories);
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const response = await fetchGeminiWithRetry(
        geminiUrl,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": apiKey.trim(),
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
        const errorData = await response.json().catch(() => null);
        console.error(
            `[AI Service] Phản hồi lỗi từ Gemini API (${response.status}):`,
            errorData,
        );
        throw new Error(
            "Hệ thống tạm thời không thể phân tích nội dung. Bạn vui lòng thử lại sau ít phút.",
        );
    }

    const data = await response.json();
    const candidateText =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!candidateText) {
        throw new Error(
            "Hệ thống không nhận được phản hồi phù hợp. Bạn vui lòng thử lại.",
        );
    }

    const cleanedJson = candidateText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    let parsed: ParsedTaskData;
    try {
        parsed = JSON.parse(cleanedJson) as ParsedTaskData;
    } catch {
        console.error("[AI Service] Lỗi parse JSON từ candidateText:", candidateText);
        throw new Error(
            "Hệ thống tạm thời chưa thể xử lý nội dung này. Bạn vui lòng thử lại.",
        );
    }

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
}

/**
 * Hàm tạo gợi ý ý tưởng AI.
 */
export async function suggestIdeasWithAi(
    currentDateStr?: string,
    categories?: string[],
): Promise<string[]> {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey || apiKey.trim() === "") {
        console.warn("[AI Service] Thiếu cấu hình NEXT_PUBLIC_GEMINI_API_KEY");
        throw new Error(
            "Dịch vụ hỗ trợ thông minh hiện chưa sẵn sàng. Bạn vui lòng thử lại sau.",
        );
    }

    const nowStr = currentDateStr || new Date().toISOString();
    const systemPrompt = getSuggestIdeasSystemPrompt(nowStr, categories);
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

    const response = await fetchGeminiWithRetry(
        geminiUrl,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": apiKey.trim(),
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
        const errorData = await response.json().catch(() => null);
        console.error(
            `[AI Service] Phản hồi lỗi khi tạo gợi ý (${response.status}):`,
            errorData,
        );
        throw new Error(
            "Hệ thống tạm thời chưa thể tạo gợi ý lúc này. Bạn vui lòng thử lại sau.",
        );
    }

    const data = await response.json();
    const candidateText =
        data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!candidateText) {
        throw new Error(
            "Hệ thống tạm thời chưa thể tạo gợi ý lúc này. Bạn vui lòng thử lại sau.",
        );
    }

    const cleanedJson = candidateText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")
        .trim();

    let ideas: unknown;
    try {
        ideas = JSON.parse(cleanedJson);
    } catch {
        console.error("[AI Service] Lỗi parse JSON gợi ý:", candidateText);
        throw new Error(
            "Hệ thống tạm thời chưa thể tạo gợi ý lúc này. Bạn vui lòng thử lại sau.",
        );
    }

    if (Array.isArray(ideas) && ideas.length > 0) {
        return ideas.map(String);
    }
    throw new Error(
        "Hệ thống tạm thời chưa thể tạo gợi ý lúc này. Bạn vui lòng thử lại sau.",
    );
}
