import { NextRequest, NextResponse } from "next/server";

import { parseTaskWithAi } from "@/services/aiService";

interface ParseTaskRequestBody {
    text: string;
    currentDate?: string;
    categories?: string[];
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req.json()) as ParseTaskRequestBody;
        const text = body.text || "";
        const nowStr = body.currentDate || new Date().toISOString();
        const userCategories = body.categories || [];

        if (!text || text.trim() === "") {
            return NextResponse.json(
                { error: "Vui lòng nhập nội dung công việc cần xử lý" },
                { status: 400 },
            );
        }

        const data = await parseTaskWithAi(text, nowStr, userCategories);
        return NextResponse.json({ success: true, data });
    } catch (err: unknown) {
        const message =
            err instanceof Error
                ? err.message
                : "Đã xảy ra lỗi phân tích công việc";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
