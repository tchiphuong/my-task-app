import { NextRequest, NextResponse } from "next/server";

interface ParseTaskRequestBody {
    text: string;
    userApiKey?: string;
    currentDate?: string;
    categories?: string[];
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as ParseTaskRequestBody;
        const { text, userApiKey, currentDate, categories } = body;

        if (!text || text.trim() === "") {
            return NextResponse.json(
                { error: "Vui lòng nhập nội dung công việc cần xử lý" },
                { status: 400 },
            );
        }

        const apiKey = userApiKey || process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                {
                    error: "Chưa cấu hình Gemini API Key. Vui lòng cung cấp API Key trong phần cài đặt hoặc thêm GEMINI_API_KEY vào biến môi trường.",
                    missingKey: true,
                },
                { status: 401 },
            );
        }

        const nowStr = currentDate || new Date().toISOString();
        const categoryList =
            categories && categories.length > 0
                ? categories.join(", ")
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
   - priority: Mức độ ưu tiên, chỉ nhận 1 trong 4 giá trị: "low", "medium", "high", "urgent". Mặc định là "medium" nếu không nhắc đến, nếu có từ như khẩn cấp, gấp, quan trọng thì chọn "urgent" hoặc "high".
   - category: Chọn 1 danh mục phù hợp nhất từ danh sách [${categoryList}], hoặc tự đặt tên danh mục ngắn gọn 1 đến 2 từ nếu chưa có.
   - repeat: Chu kỳ lặp lại, chỉ nhận 1 trong các giá trị: "none", "daily", "weekly", "monthly", "weekday".
     + "daily": nếu có nhắc đến mỗi ngày, hàng ngày.
     + "weekly": nếu có nhắc đến mỗi tuần, hàng tuần, thứ mấy hàng tuần.
     + "monthly": nếu có nhắc đến mỗi tháng, hàng tháng.
     + "weekday": nếu có nhắc đến ngày thường, từ thứ hai đến thứ sáu.
     + "none": nếu là việc làm 1 lần không lặp lại.
   - isDaily: true nếu repeat khác "none" hoặc người dùng xem đây là thói quen hàng ngày, ngược lại là false.`;

        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
                            enum: ["low", "medium", "high", "urgent"],
                        },
                        category: { type: "STRING" },
                        repeat: {
                            type: "STRING",
                            enum: [
                                "none",
                                "daily",
                                "weekly",
                                "monthly",
                                "weekday",
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

        const res = await fetch(geminiEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            const errMsg =
                errData?.error?.message ||
                `Lỗi kết nối Gemini API (${res.status})`;
            return NextResponse.json({ error: errMsg }, { status: res.status });
        }

        const data = await res.json();
        const candidate = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidate) {
            return NextResponse.json(
                { error: "AI không trả về kết quả hợp lệ" },
                { status: 502 },
            );
        }

        const parsedResult = JSON.parse(candidate);
        return NextResponse.json({ success: true, data: parsedResult });
    } catch (err: unknown) {
        const errorMsg =
            err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
        return NextResponse.json({ error: errorMsg }, { status: 500 });
    }
}
