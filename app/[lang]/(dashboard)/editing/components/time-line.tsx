"use client";

import React, { useRef, useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    Scissors, Undo2, Redo2, Trash2,
    Magnet, ZoomIn, ZoomOut,
    Play, SkipBack,
    Pause
} from "lucide-react";
import { Button } from "@/components/ui/premium-button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { useEditor } from "./editor-context";
import { formatTime } from "@/lib/utils";
import {TimelineClipItem} from "@/app/[lang]/(dashboard)/editing/components/time-line-clip-item";
import {Separator} from "@/components/ui/separator";

const TICK_GAP = 120; // 1分钟 = 120px
const HEADER_WIDTH = 100;

export function Timeline() {
    const [containerWidth, setContainerWidth] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    // 引用最外层容器
    const timelineRootRef = useRef<HTMLDivElement>(null);
    const rulerRef = useRef<HTMLDivElement>(null);

    const { state, dispatch } = useEditor();
    const { currentTime, isDraggingSeek, tracks, clips, mediaList, draggingClip } = state;

    // 监听鼠标在刻度尺上的位置
    const [hoverInfo, setHoverInfo] = useState<{ x: number; time: number } | null>(null);

    // 处理全局 Clip 移动
    useEffect(() => {
        if (!draggingClip) return;

        const handlePointerMove = (e: PointerEvent) => {
            // 1. 查找鼠标当前停留在哪个轨道上
            const elements = document.elementsFromPoint(e.clientX, e.clientY);
            // 假设你给 TrackRow 的 div 加了 data-track-id 属性
            const trackElement = elements.find(el => el.hasAttribute('data-track-id'));
            const currentTrackId = trackElement?.getAttribute('data-track-id');

            dispatch({
                type: "MOVE_CLIP_REALTIME",
                payload: {
                    mouseX: e.clientX,
                    trackId: currentTrackId || undefined
                }
            });
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", () => dispatch({ type: "STOP_DRAG_CLIP" }));

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
        };
    }, [draggingClip, dispatch]);

    useEffect(() => {
        setIsMounted(true);
        if (!timelineRootRef.current) return;

        // 使用 ResizeObserver 监听容器
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                // 获取容器的宽度内容区域宽度 (contentRect)
                setContainerWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(timelineRootRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    // 1. 逻辑时长 (用于显示 00:00 / 00:00)
    const logicalDuration = useMemo(() => {
        if (clips.length === 0) return 0;
        return clips.reduce((max, clip) => Math.max(max, clip.startTime + clip.duration), 0);
    }, [clips]);

    // 2. 视觉刻度时长 (用于背景铺满)
    const screenDuration = useMemo(() => {
        if (!isMounted || containerWidth === 0) return 30 * 60;

        // 直接用容器宽度减去内部的标题列宽度
        const availableWidth = containerWidth - HEADER_WIDTH;

        // 计算这些像素能承载多少秒
        return (availableWidth / TICK_GAP) * 60;
    }, [containerWidth, isMounted]);

    const visualDuration = useMemo(() => {
        const rawDuration = Math.max(screenDuration, logicalDuration + 60);
        // 向上取整到分钟 ---
        // 比如 130秒 会变成 180秒 (3分钟)，确保容器宽度正好能装下所有生成的刻度
        return Math.ceil(rawDuration / 60) * 60;
    }, [logicalDuration, screenDuration]);

    const ticks = useMemo(() => {
        // 因为 visualDuration 是对齐后的，比如 180s，那么 count 就是 3
        const minuteCount = visualDuration / 60;
        // 长度设为 minuteCount + 1，生成 [0, 60, 120, 180]
        return Array.from({ length: minuteCount + 1 }, (_, i) => i * 60);
    }, [visualDuration]);

    // --- 播放头拖拽逻辑 ---
    useEffect(() => {
        if (!isDraggingSeek) return;

        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (!isDraggingSeek) return;

            // 使用统一的换算函数
            const targetTime = getTimeFromEvent(e.clientX);

            dispatch({ type: "SET_TIME", payload: targetTime });
        };

        const handleGlobalMouseUp = () => {
            dispatch({ type: "SET_DRAGGING", payload: false });
        };

        window.addEventListener("mousemove", handleGlobalMouseMove);
        window.addEventListener("mouseup", handleGlobalMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleGlobalMouseMove);
            window.removeEventListener("mouseup", handleGlobalMouseUp);
        };
    }, [isDraggingSeek, dispatch]);

    // 播放头定位
    const playheadLeft = HEADER_WIDTH + (currentTime / 60) * TICK_GAP - 6;

    // 监听键盘删除键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === "Delete" || e.key === "Backspace") && state.selectedId) {
                // 防止正在输入文字时误删
                if (document.activeElement?.tagName !== "INPUT") {
                    dispatch({ type: "REMOVE_CLIP", payload: state.selectedId });
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [state.selectedId, dispatch]);

    const getTimeFromEvent = (clientX: number) => {
        // 1. 获取 ScrollArea 的可视视口 (Viewport)
        const viewport = rulerRef.current?.closest('[data-radix-scroll-area-viewport]');
        if (!viewport || !rulerRef.current) return 0;

        const rect = viewport.getBoundingClientRect();
        const scrollLeft = viewport.scrollLeft;

        // 2. 计算相对于视口左侧的距离，加上滚动偏移，减去左侧标题宽度
        // 注意：如果你的容器有 padding-left (如之前的 p-6)，需要在这里减去 24
        const x = clientX - rect.left + scrollLeft - HEADER_WIDTH;

        // 3. 换算为秒
        const calcTime = (x / TICK_GAP) * 60;

        // 4. 边界约束
        return Math.min(Math.max(0, calcTime), visualDuration);
    };

    return (
        <div ref={timelineRootRef} className="flex-1 flex flex-col min-h-0 overflow-hidden select-none bg-background">
            {/* 工具栏 */}
            <div className="py-2 flex items-center justify-between px-4 border-b shrink-0 bg-card/30">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => dispatch({ type: "SET_PLAYING", payload: !state.isPlaying })}>
                        {state.isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </Button>
                    <Button variant="ghost" size="icon"><SkipBack size={18} /></Button>

                    <div className="px-3 py-1 font-mono flex items-center gap-1">
                        <span className="text-primary font-bold">{formatTime(currentTime)}</span>
                        <span className="opacity-30">/</span>
                        <span className="opacity-50">{isMounted ? formatTime(logicalDuration) : "00:00"}</span>
                    </div>
                    <Separator
                        orientation="vertical"
                        className="data-[orientation=vertical]:h-4"
                    />
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Scissors size={14}/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Undo2 size={14}/></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Redo2 size={14}/></Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={!state.selectedId}
                            onClick={() => state.selectedId && dispatch({ type: "REMOVE_CLIP", payload: state.selectedId })}
                            className={state.selectedId ? "text-destructive" : "opacity-50"}
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 px-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Magnet size={14}/></Button>
                    <div className="flex items-center gap-2">
                        <ZoomOut size={14} className="opacity-50" />
                        <Slider className="w-24" defaultValue={[50]} />
                        <ZoomIn size={14} className="opacity-50" />
                    </div>
                </div>
            </div>

            <ScrollArea className="flex-1">
                <div
                    ref={rulerRef}
                    className="relative pb-5"
                    style={{ width: HEADER_WIDTH + (visualDuration / 60) * TICK_GAP + 20 }}
                >
                    {state.snapLineTime !== null && (
                        <div
                            className="absolute top-0 bottom-0 w-px z-40 pointer-events-none bg-primary"
                            style={{ left: HEADER_WIDTH + (state.snapLineTime / 60) * TICK_GAP }}
                        />
                    )}
                    {/* 时间刻度尺 */}
                    <div
                        className="h-8 sticky top-0 z-30 flex items-end bg-background border-b border-border/50 cursor-crosshair mb-5"
                        onPointerMove={(e) => {
                            const time = getTimeFromEvent(e.clientX);
                            // 用于 Tooltip 显示
                            setHoverInfo({ x: e.clientX, time });
                        }}
                        onPointerLeave={() => setHoverInfo(null)}
                        onClick={(e) => {
                            const targetTime = getTimeFromEvent(e.clientX);
                            dispatch({ type: "SET_TIME", payload: targetTime });
                        }}
                    >
                        {/* 左侧标题列占位 */}
                        <div style={{ width: HEADER_WIDTH }} className="shrink-0 h-full border-r border-border/50 bg-background" />

                        {/* 刻度渲染区 */}
                        <div className="relative flex-1 h-full">
                            {ticks.map((t) => (
                                <div
                                    key={t}
                                    className="absolute bottom-0 border-l border-border pointer-events-none"
                                    style={{ left: (t / 60) * TICK_GAP, height: t % 300 === 0 ? '14px' : '8px' }}
                                >
                                    {t % 60 === 0 && (
                                        <span className="absolute left-1 bottom-1 opacity-40 font-mono">
                                            {t / 60}m
                                        </span>
                                    )}
                                </div>
                            ))}

                            {/* 悬浮时间提示 (Tooltip) */}
                            {hoverInfo && (
                                <div
                                    className="absolute top-0 z-50 pointer-events-none flex flex-col items-center"
                                    // 这里的定位：(时间 / 60) * 120 + HEADER_WIDTH
                                    style={{ left: (hoverInfo.time / 60) * TICK_GAP}}
                                >

                                    <div className="
                                        bg-popover text-popover-foreground border shadow-md
                                        px-2 py-0.5 rounded-sm whitespace-nowrap font-mono
                                        bottom-full mb-1 -translate-x-1/2
                                        animate-in fade-in zoom-in-95 duration-100
                                    ">
                                        {formatTime(hoverInfo.time)}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 动态轨道列表 */}
                    <div className="mt-2 flex flex-col gap-1">
                        {tracks.map((track) => (
                            <TrackRow
                                key={track.id}
                                track={track}
                                clips={clips.filter(c => c.trackId === track.id)}
                                mediaList={mediaList}
                            />
                        ))}
                    </div>

                    {/* 播放头进度线 (Playhead) */}
                    <div
                        className="absolute top-0 bottom-0 z-50 cursor-ew-resize group flex flex-col items-center"
                        style={{
                            left: playheadLeft,
                            transition: isDraggingSeek ? 'none' : 'left 0.1s linear'
                        }}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            dispatch({ type: "SET_DRAGGING", payload: true });
                        }}
                    >
                        {/* 播放头顶部（Shadcn 风格） */}
                        <div className="w-3 h-3 bg-primary rounded-full border-2 border-background shadow-md z-10" />
                        <div className="w-0.5 h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    </div>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}

// --- 轨道组件 ---
function TrackRow({ track, clips, mediaList }: { track: any, clips: any[], mediaList: any[] }) {
    const { state, dispatch } = useEditor();
    const [isOver, setIsOver] = useState(false);

    // 处理 Drop 事件
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);

        const actionType = e.dataTransfer.getData("actionType");
        const clipId = e.dataTransfer.getData("clipId");
        const mediaId = e.dataTransfer.getData("mediaId");

        // 依然获取位置用于“换位置”参考
        const rect = e.currentTarget.getBoundingClientRect();
        const scrollArea = e.currentTarget.closest('[data-radix-scroll-area-viewport]');
        const scrollLeft = scrollArea?.scrollLeft || 0;
        const x = e.clientX - rect.left - 100 + scrollLeft; // 100 是 HEADER_WIDTH
        const dropTime = Math.max(0, (x / 120) * 60);

        if (actionType === "MOVE_CLIP" && clipId) {
            // --- 移动逻辑 ---
            // 简单实现：移动到鼠标释放的时间点（你也可以做成和新增一样的“顶头”逻辑）
            dispatch({
                type: "UPDATE_CLIP_TIME",
                payload: { clipId, newStartTime: dropTime, newTrackId: track.id }
            });
        } else if (mediaId) {
            // --- 新增逻辑 (保持你之前的顶头算法) ---
            dispatch({
                type: "ADD_CLIP_TO_TRACK",
                payload: { assetId: mediaId, trackId: track.id }
            });
        }
    };

    return (
        <div
            data-track-id={track.id}
            className={`flex h-20 group relative border-b border-border/20 transition-colors ${
                isOver ? 'bg-primary/5' : ''
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
            onDragLeave={() => setIsOver(false)}
            onDrop={handleDrop}
        >
            {/* 轨道头部 */}
            <div style={{ width: 100 }} className="shrink-0 flex items-center justify-center bg-card border-r z-20">
                <span className="text-[10px] font-bold opacity-40 uppercase">{track.type}</span>
            </div>

            {/* 内容区 */}
            <div className="flex-1 relative">
                {/* 只有视频轨道才显示高亮虚线引导 */}
                {isOver && track.type === 'video' && (
                    <div className="absolute inset-2 border-2 border-dashed border-primary/30 rounded-xl pointer-events-none animate-pulse" />
                )}

                {clips.map(clip => {
                    const asset = mediaList.find(a => a.id === clip.assetId);
                    const isSelected = state.selectedId === clip.id;
                    const isDragging = state.draggingClip?.id === clip.id;

                    return (
                        <TimelineClipItem key={clip.assetId} clip={clip} asset={asset} isSelected={isSelected} isDragging={isDragging}></TimelineClipItem>
                    );
                })}
            </div>
        </div>
    );
}