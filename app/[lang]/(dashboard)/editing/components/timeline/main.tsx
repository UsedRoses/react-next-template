"use client";

import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TimelineToolbar } from "./TimelineToolbar";
import { TimeRuler } from "./TimeRuler";
import { TrackRow } from "./TrackRow";
import { Playhead } from "./Playhead";
import { SnapLine } from "./SnapLine";
import { useEditorStore } from "@/hooks/use-editor-store";

export const TICK_GAP = 120; // 1分钟 = 120px
export const HEADER_WIDTH = 100;

export function Timeline() {
    const timelineRootRef = useRef<HTMLDivElement>(null);
    const rulerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    const tracks = useEditorStore(state => state.tracks);
    const clips = useEditorStore(state => state.clips);
    const draggingClip = useEditorStore(state => state.draggingClip);
    const isDraggingSeek = useEditorStore(state => state.isDraggingSeek);

    const moveClipRealtime = useEditorStore(state => state.moveClipRealtime);
    const stopDragClip = useEditorStore(state => state.stopDragClip);
    const setCurrentTime = useEditorStore(state => state.setCurrentTime);
    const setDraggingSeek = useEditorStore(state => state.setDraggingSeek);


    // 1. 挂载与尺寸监听
    useEffect(() => {
        setIsMounted(true);
        if (!timelineRootRef.current) return;
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) setContainerWidth(entry.contentRect.width);
        });
        resizeObserver.observe(timelineRootRef.current);
        return () => resizeObserver.disconnect();
    }, []);

    // 2. 逻辑时长计算
    const logicalDuration = useMemo(() => {
        if (clips.length === 0) return 0;
        return clips.reduce((max, clip) => Math.max(max, clip.startTime + clip.duration), 0);
    }, [clips]);

    // 3. 视觉展示时长 (补齐屏幕宽度)
    const visualDuration = useMemo(() => {
        const screenSec = isMounted ? ((containerWidth - HEADER_WIDTH) / TICK_GAP) * 60 : 1800;
        const raw = Math.max(screenSec, logicalDuration);
        return Math.ceil(raw / 60) * 60; // 对齐到分钟
    }, [logicalDuration, containerWidth, isMounted]);

    // 4. 统一的坐标转换算法 (通过 Ref 传递，不触发重绘)
    const getTimeFromEvent = useCallback((clientX: number) => {
        const viewport = rulerRef.current?.closest('[data-radix-scroll-area-viewport]');
        if (!viewport) return 0;
        const rect = viewport.getBoundingClientRect();
        const x = clientX - rect.left + viewport.scrollLeft - HEADER_WIDTH;
        return Math.min(Math.max(0, (x / TICK_GAP) * 60), visualDuration);
    }, [visualDuration]);

    // 5. 全局指针监听 (仅在拖拽时激活)
    useEffect(() => {
        if (!draggingClip) return;
        const handlePointerMove = (e: PointerEvent) => {
            const elements = document.elementsFromPoint(e.clientX, e.clientY);
            const trackId = elements.find(el => el.hasAttribute('data-track-id'))?.getAttribute('data-track-id');
            moveClipRealtime(e.clientX, trackId || undefined)
        };
        const handlePointerUp = () => stopDragClip();
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
        };
    }, [draggingClip, stopDragClip]);

    // --- 处理播放头拖拽的实时更新 ---
    useEffect(() => {
        // 只有当播放头处于“被点击/拖拽”状态时，才激活全局监听
        if (!isDraggingSeek) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            // 使用你定义的坐标转换函数
            const targetTime = getTimeFromEvent(e.clientX);
            // 实时更新全局时间
            setCurrentTime(targetTime);
        };

        const handleGlobalMouseUp = () => {
            // 松手时停止拖拽状态
            setDraggingSeek(false);
        };

        // 在 window 上监听，确保鼠标移出时间轴区域也能继续拖动
        window.addEventListener("mousemove", handleGlobalMouseMove);
        window.addEventListener("mouseup", handleGlobalMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleGlobalMouseMove);
            window.removeEventListener("mouseup", handleGlobalMouseUp);
        };
    }, [isDraggingSeek, setCurrentTime, getTimeFromEvent, setDraggingSeek]);

    return (
        <div ref={timelineRootRef} className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden select-none">
            <TimelineToolbar logicalDuration={logicalDuration} isMounted={isMounted} />

            <ScrollArea className="flex-1">
                <div
                    ref={rulerRef}
                    className="relative pb-5"
                    style={{ width: HEADER_WIDTH + (visualDuration / 60) * TICK_GAP + 20 }}
                >
                    <TimeRuler visualDuration={visualDuration} getTimeFromEvent={getTimeFromEvent} />

                    <div className="mt-2 flex flex-col gap-1">
                        {tracks.map(track => <TrackRow key={track.id} track={track} />)}
                    </div>

                    {/* 辅助线层 */}
                    <SnapLine />

                    {/* 高频渲染层：播放头 */}
                    <Playhead />
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}