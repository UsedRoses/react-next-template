import React, { memo } from "react";
import { VideoFilmstrip } from "./VideoFilmstrip";
import { TICK_GAP } from "./main";
import { useEditorStore } from "@/hooks/use-editor-store";


export const TimelineClipItem = memo(({ clip, asset, isSelected, isDragging }: any) => {
    const startDragClip = useEditorStore(state => state.startDragClip)

    const handlePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation();
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        startDragClip(clip.id, e.clientX, clip.startTime)
    };

    return (
        <div
            onPointerDown={handlePointerDown}
            className={`
            absolute inset-y-1 rounded-md overflow-hidden flex items-center select-none touch-none transition-all duration-75
            ${!isSelected && !isDragging ? "z-10" : ""}
            ${isSelected && !isDragging ? "border-primary ring-2 ring-primary/20 z-30 shadow-lg" : ""}
            ${isDragging ? "transition-none border-primary opacity-70 z-50 cursor-grabbing bg-primary/20" : "cursor-grab z-20 transition-transform duration-300 ease-out"}
            `}
            style={{
                width: (clip.duration / 60) * TICK_GAP,
                transform: `translate3d(${(clip.startTime / 60) * TICK_GAP}px, 0, 0)`,
                willChange: "transform",
            }}
        >
            {asset && <VideoFilmstrip file={asset.file} width={(clip.duration / 60) * TICK_GAP} />}
        </div>
    );
}, (prev, next) => {
    // 只有这四个核心属性变化时才允许重绘
    return prev.clip.startTime === next.clip.startTime &&
        prev.clip.trackId === next.clip.trackId &&
        prev.isSelected === next.isSelected &&
        prev.isDragging === next.isDragging;
});