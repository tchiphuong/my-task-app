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

        const systemPrompt = `Bạn là trợ lý AI chuyên bóc tách thông tin công việc cho ứng dụng My Task App.
Thời điểm hiện tại của người dùng là: ${nowStr}.
Danh sách danh mục công việc hiện có gồm: ${categoryList}.

Nhiệm vụ của bạn:
1. Đọc kỹ câu mô tả bằng tiếng Việt tự nhiên của người dùng.
2. Bóc tách và chuẩn hóa thông tin thành định dạng JSON chuẩn.
3. Các trường cần trích xuất:
   - title: Tiêu đề công việc ngắn gọn, rõ ràng, viết hoa chữ cái đầu.
   - description: Mô tả chi tiết nếu có thêm thông tin phụ, hoặc để chuỗi rỗng nếu không có.
   - dueDate: Ngày hoặc ngày giờ hạn chót theo định dạng YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm nếu có giờ cụ thể. Tính toán chính xác dựa vào thời điểm hiện tại ${nowStr} và các từ chỉ thời gian như hôm nay, ngày mai, thứ 2 tuần sau, cuối tháng này... Nếu không nhắc đến ngày giờ thì để null.
   - startDate: Ngày bắt đầu nếu người dùng có nói từ ngày nào đến ngày nào (định dạng YYYY-MM-DD), nếu không thì để null.
   - priority: Mức độ ưu tiên, chỉ nhận 1 trong 3 giá trị: "low", "medium", "high". Mặc định là "medium" nếu không nhắc đến, nếu có từ như khẩn cấp, gấp, quan trọng thì chọn "high".
   - category: Chọn 1 danh mục phù hợp nhất từ danh sách [${categoryList}], hoặc tự đặt tên danh mục ngắn gọn 1 đến 2 từ nếu chưa có.
   - repeat: Chu kỳ lặp lại, chỉ nhận 1 trong các giá trị: "none", "daily", "weekdays", "weekly", "monthly".
     + "daily": nếu có nhắc đến mỗi ngày, hàng ngày.
     + "weekdays": nếu có nhắc đến ngày thường, từ thứ hai đến thứ sáu.
     + "weekly": nếu có nhắc đến mỗi tuần, hàng tuần, thứ mấy hàng tuần.
     + "monthly": nếu có nhắc đến mỗi tháng, hàng tháng.
     + "none": nếu là việc làm 1 lần không lặp lại.
   - isDaily: true nếu repeat khác "none" hoặc người dùng xem đây là thói quen hàng ngày, ngược lại là false.`;

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
