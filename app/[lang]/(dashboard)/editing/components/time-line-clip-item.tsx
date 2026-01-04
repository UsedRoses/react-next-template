"use client";

import React, { memo } from "react";
import {MediaAsset, TimelineClip, useEditor} from "./editor-context";
import { VideoFilmstrip } from "./video-film-strip";

interface Props {
    clip: TimelineClip;
    asset: MediaAsset;
    isFirst?: boolean;
    isSelected: boolean;
    isDragging: boolean;
}

const TICK_GAP = 120; // 必须与父组件一致

export const TimelineClipItem = memo(({ clip, asset, isSelected, isDragging }: Props) => {
    const { dispatch } = useEditor();

    const handlePointerDown = (e: React.PointerEvent) => {
        // 阻止冒泡，防止触发时间轴的播放头拖拽
        e.stopPropagation();
        // 捕获指针，这样鼠标移出 Clip 范围也能继续监听
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);

        dispatch({
            type: "START_DRAG_CLIP",
            payload: {
                id: clip.id,
                mouseX: e.clientX,
                startTime: clip.startTime
            }
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        dispatch({ type: "STOP_DRAG_CLIP" });
    };

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            className={`
            absolute inset-y-1 rounded-md overflow-hidden flex items-center select-none touch-none transition-all duration-75
            ${isDragging ? "transition-none" : "transition-all duration-150"}
            ${!isSelected && !isDragging ? "z-10" : ""}
            ${isSelected && !isDragging ? "border-primary ring-2 ring-primary/20 z-30 shadow-lg" : ""}
            ${isDragging ? "border-primary opacity-70 z-50 cursor-grabbing bg-primary/20" : "cursor-grab"}
            `}
            style={{
                width: (clip.duration / 60) * TICK_GAP,
                transform: `translateX(${(clip.startTime / 60) * TICK_GAP}px)`,
                willChange: "transform",
            }}
        >
            {asset && <VideoFilmstrip file={asset.file} width={(clip.duration / 60) * TICK_GAP} />}

            {/* 选中时的特殊遮罩 */}
            {isSelected && <div className="absolute inset-0 bg-primary/10 pointer-events-none" />}

            <div className="absolute top-0.5 left-1 bg-black/40 px-1 rounded pointer-events-none">
                {asset?.file.name}
            </div>
        </div>
    );
}, (prev, next) => {
    // 自定义比较：只有当时间、选中状态、拖拽状态变化时才重新渲染
    return (
        prev.clip.startTime === next.clip.startTime &&
        prev.clip.trackId === next.clip.trackId &&
        prev.isSelected === next.isSelected &&
        prev.isDragging === next.isDragging &&
        prev.asset === next.asset
    );
});

TimelineClipItem.displayName = "TimelineClipItem";