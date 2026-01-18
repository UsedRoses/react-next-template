import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        // 1. 校验 (可以在这里做鉴权，比如检查用户 Token)
        // if (!req.headers.get("Authorization")) return new Response("Unauthorized", { status: 401 });

        console.log(`[API] 收到请求: Action=${action}`, payload);

        // ----------------------------------------------------
        // 开发阶段：Mock 模式 (不连 FastAPI，先跑通前端流程)
        // ----------------------------------------------------
        if (process.env.NODE_ENV === 'development') {
            await new Promise(resolve => setTimeout(resolve, 3000)); // 模拟 AI 生成耗时

            // 返回一个假视频链接
            return NextResponse.json({
                success: true,
                type: 'video', // 或 'image'，根据 action 判断
                url: "https://cdn.pixabay.com/video/2023/10/22/186115-877653243_large.mp4"
            });
        }

        // ----------------------------------------------------
        // 生产阶段：转发给 FastAPI
        // ----------------------------------------------------
        // const fastApiResponse = await fetch(`${process.env.FASTAPI_URL}/api/v1/${action}`, {
        //   method: "POST",
        //   headers: { "Content-Type": "application/json" },
        //   body: JSON.stringify(payload)
        // });

        // if (!fastApiResponse.ok) throw new Error("Backend Error");
        // const data = await fastApiResponse.json();
        // return NextResponse.json(data);

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Failed to process request" },
            { status: 500 }
        );
    }
}