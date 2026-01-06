"use client";

import React, { useState, useMemo, memo } from "react";
import { Film, Type, Music } from "lucide-react";
import { TimelineClipItem } from "./TimelineClipItem";
import { HEADER_WIDTH } from "./main";
import { useEditorStore } from "@/hooks/use-editor-store";

interface TrackRowProps {
    track: {
        id: string;
        type: "video" | "audio" | "text";
    };
}

export const TrackRow = memo(({ track }: TrackRowProps) => {
    const [isOver, setIsOver] = useState(false);
    // 1. 仅订阅结构数据（clips, mediaList）和 选中/拖拽状态
    const clips = useEditorStore(state => state.clips)
    const mediaList = useEditorStore(state => state.mediaList)
    const selectedId = useEditorStore(state => state.selectedId)
    const draggingClip = useEditorStore(state => state.draggingClip)

    const addClipToTrack = useEditorStore(state => state.addClipToTrack)


    // 2. 性能优化：使用 useMemo 过滤属于本轨道的 Clips
    // 只有当全局 clips 数组引用变化时才会重新过滤
    const myClips = useMemo(() =>
            clips.filter((c) => c.trackId === track.id),
        [clips, track.id]);

    // 3. 处理放置逻辑（从外部素材库拖入 或 内部移动）
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);

        const mediaId = e.dataTransfer.getData("mediaId");
        // 这里的逻辑可以根据你的需求扩展，比如处理跨轨移动
        if (mediaId) {
            addClipToTrack(mediaId, track.id)
        }
    };

    return (
        <div
            // 用于指针事件探测当前在哪个轨道上
            data-track-id={track.id}
            className={`flex h-20 group relative border-b border-border/20 transition-colors ${
                isOver ? "bg-primary/5" : ""
            }`}
            onDragOver={(e) => {
                e.preventDefault();
                setIsOver(true);
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={handleDrop}
        >
            {/* 左侧轨道头部 */}
            <div
                style={{ width: HEADER_WIDTH }}
                className="shrink-0 flex flex-col items-center justify-center bg-card border-r border-border/50 z-20 gap-1"
            >
                {track.type === "video" && <Film size={16} className="text-muted-foreground/50" />}
                {track.type === "text" && <Type size={16} className="text-muted-foreground/50" />}
                {track.type === "audio" && <Music size={16} className="text-muted-foreground/50" />}
                <span className="font-bold opacity-30 uppercase tracking-tighter">
                    {track.type}
                </span>
            </div>

            {/* 右侧内容区 */}
            <div className="flex-1 relative min-w-0">
                {/* 拖拽悬浮时的占位高亮 */}
                {isOver && (
                    <div className="absolute inset-1 border border-dashed border-primary/30 rounded-md pointer-events-none animate-pulse" />
                )}

                {/* 渲染片段列表 */}
                {myClips.map((clip) => {
                    const asset = mediaList.find((a) => a.id === clip.assetId);
                    // 在这里预计算状态，保持传递给子组件的是简单布尔值
                    const isSelected = selectedId === clip.id;
                    const isDragging = draggingClip?.id === clip.id;

                    return (
                        <TimelineClipItem
                            key={clip.id} // 必须使用 clip.id
                            clip={clip}
                            asset={asset}
                            isSelected={isSelected}
                            isDragging={isDragging}
                        />
                    );
                })}
            </div>
        </div>
    );
});

TrackRow.displayName = "TrackRow";