"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Eye, EyeOff, Play, Pause, Volume2, VolumeX, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
    src: string;
    compareSrc?: string;
    poster?: string;
    className?: string;
    autoPlay?: boolean;
    sourceFit?: "fill" | "cover" | "contain";
}

export function VideoComparisonPlayer({
                                          src,
                                          compareSrc,
                                          poster,
                                          className,
                                          autoPlay = false,
                                          sourceFit = "fill"
                                      }: Props) {
    const isCompareMode = !!compareSrc;

    // --- State ---
    const [sliderPos, setSliderPos] = useState(50);
    const [isPlaying, setIsPlaying] = useState(autoPlay);
    const [isMuted, setIsMuted] = useState(false);
    const [showOverlay, setShowOverlay] = useState(true);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false); // 默认不显示loading，等待事件触发
    const [isDraggingSlider, setIsDraggingSlider] = useState(false);

    // [修复关键]：增加宽高比状态，初始化为 undefined
    const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);

    // Refs
    const containerRef = useRef<HTMLDivElement>(null);
    const videoMainRef = useRef<HTMLVideoElement>(null);
    const videoSubRef = useRef<HTMLVideoElement>(null);

    // --- 核心同步逻辑 ---
    const syncVideos = useCallback(() => {
        const main = videoMainRef.current;
        const sub = videoSubRef.current;
        if (!main) return;

        setCurrentTime(main.currentTime);
        const safeDuration = main.duration || 1;
        setProgress((main.currentTime / safeDuration) * 100);

        if (sub && isCompareMode) {
            if (Math.abs(main.currentTime - sub.currentTime) > 0.1) {
                sub.currentTime = main.currentTime;
            }
            if (!main.paused && sub.paused) sub.play().catch(()=>{});
            if (main.paused && !sub.paused) sub.pause();
        }
    }, [isCompareMode]);

    // --- 事件监听 ---
    useEffect(() => {
        const main = videoMainRef.current;
        if (!main) return;

        // 1. 获取视频尺寸和时长，锁定容器比例
        const onLoadedMetadata = () => {
            setDuration(main.duration);
            if (main.videoWidth && main.videoHeight) {
                setAspectRatio(main.videoWidth / main.videoHeight);
            }
            setIsBuffering(false);
        };

        main.addEventListener("loadedmetadata", onLoadedMetadata);
        main.addEventListener("timeupdate", syncVideos);
        main.addEventListener("waiting", () => setIsBuffering(true));
        main.addEventListener("playing", () => setIsBuffering(false));
        main.addEventListener("ended", () => setIsPlaying(false));

        return () => {
            main.removeEventListener("loadedmetadata", onLoadedMetadata);
            main.removeEventListener("timeupdate", syncVideos);
            main.removeEventListener("waiting", () => setIsBuffering(true));
            main.removeEventListener("playing", () => setIsBuffering(false));
            main.removeEventListener("ended", () => setIsPlaying(false));
        };
    }, [syncVideos]);

    // --- 交互控制 ---
    const togglePlay = useCallback((e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (isDraggingSlider) return;

        const main = videoMainRef.current;
        if (!main) return;

        if (main.paused) {
            main.play().catch(() => setIsMuted(true));
            videoSubRef.current?.play().catch(()=>{});
            setIsPlaying(true);
        } else {
            main.pause();
            videoSubRef.current?.pause();
            setIsPlaying(false);
        }
    }, [isDraggingSlider]);

    const handleSeek = (val: number[]) => {
        const main = videoMainRef.current;
        if (!main || !duration) return;
        const time = (val[0] / 100) * duration;
        main.currentTime = time;
        if (videoSubRef.current) videoSubRef.current.currentTime = time;
        setProgress(val[0]);
    };

    const handleSliderMove = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        setSliderPos((x / rect.width) * 100);
    }, []);

    useEffect(() => {
        const move = (e: MouseEvent) => isDraggingSlider && handleSliderMove(e.clientX);
        const up = () => setIsDraggingSlider(false);
        if (isDraggingSlider) {
            window.addEventListener("mousemove", move);
            window.addEventListener("mouseup", up);
        }
        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseup", up);
        };
    }, [isDraggingSlider, handleSliderMove]);


    return (
        <div
            ref={containerRef}
            className={cn(
                // [布局修复]
                // 1. relative inline-flex: 让容器像图片一样，尺寸由内容决定
                // 2. max-w-full max-h-full: 受限于父级大小，防止溢出
                // 3. justify-center items-center: 内容居中
                "relative inline-flex justify-center items-center bg-black select-none group shadow-xl overflow-hidden rounded-xl",
                "max-w-full max-h-full",
                className
            )}
            // [关键] 如果已获取到比例，强制锁定 aspect-ratio，防止播放瞬间跳变
            style={{
                aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto'
            }}
            onContextMenu={e => e.preventDefault()}
        >
            {/* Loading */}
            {isBuffering && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
            )}

            {/*
                LAYER 1: Processed Video (After) - 主视频
                [CSS修复]
                - w-auto h-auto: 允许视频使用原始尺寸
                - max-w-full max-h-full: 遇到父容器限制时自动缩小
                - object-contain: 保持比例
            */}
            <video
                ref={videoMainRef}
                src={src}
                poster={poster}
                className="block w-auto h-auto max-w-full max-h-full object-contain cursor-pointer"
                muted={isMuted}
                playsInline
                preload="metadata"
                onClick={togglePlay}
            />

            {/*
                LAYER 2: Source Video (Before) - 对比层
                - absolute inset-0: 覆盖在 Layer 1 上，尺寸完全跟随 Layer 1
            */}
            {isCompareMode && (
                <div
                    className={cn(
                        "absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300",
                        showOverlay ? "opacity-100" : "opacity-0"
                    )}
                    style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                >
                    <video
                        ref={videoSubRef}
                        src={compareSrc}
                        // 强制填满容器，避免因为 sourceFit 导致两边大小不一
                        className={cn(
                            "w-full h-full",
                            sourceFit === "fill" ? "object-fill" :
                                sourceFit === "cover" ? "object-cover" : "object-contain"
                        )}
                        muted={true}
                        playsInline
                        preload="metadata"
                    />

                    <div className="absolute top-4 left-4 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded shadow text-base z-10">
                        SOURCE
                    </div>
                </div>
            )}

            {isCompareMode && showOverlay && sliderPos < 95 && (
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-1 rounded shadow pointer-events-none text-base z-10">
                    PROCESSED
                </div>
            )}

            {/* 分割线 */}
            {isCompareMode && showOverlay && (
                <div
                    className="absolute top-0 bottom-0 w-10 -ml-5 z-20 cursor-ew-resize flex justify-center group/line"
                    style={{ left: `${sliderPos}%` }}
                    onMouseDown={(e) => { e.stopPropagation(); setIsDraggingSlider(true); }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="w-0.5 h-full bg-white/80 shadow-[0_0_10px_black] group-hover/line:bg-white transition-colors" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg text-black">
                        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none"><path d="M15 18l-6-6 6-6"/><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                </div>
            )}

            {/* 播放按钮 (状态指示) */}
            {!isPlaying && !isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                        <Play className="w-6 h-6 text-white ml-1 fill-white" />
                    </div>
                </div>
            )}

            {/* 底部控制条 */}
            <div
                className="absolute bottom-0 left-0 right-0 p-4 pt-12 bg-linear-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2 z-30 text-base"
                onClick={(e) => e.stopPropagation()}
            >
                <Slider
                    value={[progress]}
                    max={100}
                    step={0.1}
                    onValueChange={handleSeek}
                    className="w-full cursor-pointer"
                />

                <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-4">
                        <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                            {isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current"/>}
                        </button>
                        <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-primary transition-colors">
                            {isMuted ? <VolumeX className="w-5 h-5"/> : <Volume2 className="w-5 h-5"/>}
                        </button>
                        <span className="text-xs font-mono text-white/80">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    {isCompareMode && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowOverlay(!showOverlay)}
                            className="h-7 text-xs gap-1.5 bg-white/10 hover:bg-white/20 text-white border-none"
                        >
                            {showOverlay ? <Eye className="w-3.5 h-3.5"/> : <EyeOff className="w-3.5 h-3.5"/>}
                            {showOverlay ? "Hide Diff" : "Show Diff"}
                        </Button>
                    )}
                </div>
            </div>

        </div>
    );
}

function formatTime(seconds: number) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}