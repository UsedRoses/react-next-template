"use client";

import React, { memo } from "react";
import { TICK_GAP, HEADER_WIDTH } from "./main";
import { useEditorStore } from "@/hooks/use-editor-store";

export const SnapLine = memo(() => {
    // 1. 仅订阅中频变化的控制状态
    const snapLineTime = useEditorStore(state => state.snapLineTime)

    // 2. 如果没有磁吸发生，返回 null，不占用渲染资源
    if (snapLineTime === null) return null;

    // 3. 计算位置
    const left = HEADER_WIDTH + (snapLineTime / 60) * TICK_GAP;

    return (
        <div
            className="absolute top-0 bottom-0 w-px z-40 pointer-events-none"
            style={{
                left,
                // 使用 CSS 渐变实现更加专业的虚线效果
                backgroundImage: `linear-gradient(to bottom, oklch(var(--primary)) 60%, transparent 40%)`,
                backgroundSize: '1px 10px',
                // 添加外发光，增强视觉引导
                filter: "drop-shadow(0 0 4px oklch(var(--primary) / 0.8))"
            }}
        >
            {/* 顶部的磁吸小三角 */}
            <div className="absolute top-0 -left-1 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-[6px] border-t-primary shadow-lg" />

            {/* 底部的小三角 */}
            <div className="absolute bottom-0 -left-1 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-b-[6px] border-b-primary shadow-lg" />
        </div>
    );
});

SnapLine.displayName = "SnapLine";