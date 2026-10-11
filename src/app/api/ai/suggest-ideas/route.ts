import { NextRequest, NextResponse } from "next/server";

import { suggestIdeasWithAi } from "@/services/aiService";

interface SuggestIdeasRequestBody {
    currentDate?: string;
    categories?: string[];
}

export async function POST(req: NextRequest) {
    try {
        const body = (await req
            .json()
            .catch(() => ({}))) as SuggestIdeasRequestBody;
        const nowStr = body.currentDate || new Date().toISOString();
        const categories = body.categories || [];

        const ideas = await suggestIdeasWithAi(nowStr, categories);
        return NextResponse.json({ success: true, ideas });
    } catch (err: unknown) {
        const message =
            err instanceof Error ? err.message : "Đã xảy ra lỗi khi tạo gợi ý";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
