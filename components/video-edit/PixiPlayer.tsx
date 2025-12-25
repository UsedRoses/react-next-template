"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { useEditor } from "./EditorContext";
import { Loader2, AlertCircle } from "lucide-react";

interface PixiPlayerProps {
    src?: string | File;
    autoPlay?: boolean;
}

export default function PixiPlayer({ src, autoPlay = false }: PixiPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const textMapRef = useRef<Map<string, PIXI.Text>>(new Map());

    // --- 性能优化相关 Ref ---
    const lastSeekTimeRef = useRef<number>(0); // 记录上次 Seek 时间，用于节流
    const isInternalSeekingRef = useRef(false); // 标记是否正在执行 Seek

    const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    const { state, dispatch } = useEditor();
    const { isPlaying, currentTime, subtitles, selectedId, isDraggingSeek } = state;

    // 1. 处理视频源转换
    useEffect(() => {
        if (!src) return;
        setLoadingState('loading');
        const url = src instanceof File ? URL.createObjectURL(src) : src;
        setBlobUrl(url);
        return () => { if (url.startsWith('blob:')) URL.revokeObjectURL(url); };
    }, [src]);

    // 2. 初始化 Pixi 引擎
    useEffect(() => {
        if (!containerRef.current || !videoRef.current || !blobUrl) return;

        const video = videoRef.current;
        let app: PIXI.Application;

        const init = async () => {
            try {
                if (video.readyState < 1) {
                    await new Promise((r) => (video.onloadedmetadata = r));
                }

                app = new PIXI.Application();

                await app.init({
                    width: video.videoWidth,
                    height: video.videoHeight,
                    backgroundAlpha: 0,
                    resolution: window.devicePixelRatio || 1,
                    autoDensity: true,
                });

                // --- 布局适配修复 ---
                // 直接控制 canvas 样式，使其在容器内 contain 居中且不溢出
                app.canvas.style.width = "100%";
                app.canvas.style.height = "100%";
                app.canvas.style.objectFit = "contain";
                app.canvas.style.display = "block";

                const wrapper = document.getElementById("pixi-inner-wrapper");
                if (wrapper) wrapper.appendChild(app.canvas);
                appRef.current = app;

                // 视频纹理
                const texture = PIXI.Texture.from(video);
                const videoSprite = new PIXI.Sprite(texture);
                videoSprite.width = video.videoWidth;
                videoSprite.height = video.videoHeight;
                app.stage.addChild(videoSprite);

                // 字幕层
                const subContainer = new PIXI.Container();
                subContainer.label = "subtitle-layer";
                app.stage.addChild(subContainer);

                // 启用交互系统
                app.stage.eventMode = 'static';
                app.stage.hitArea = app.screen;

                dispatch({ type: "SET_DURATION", payload: video.duration });
                setLoadingState('ready');

                // --- 帧同步：只有在不拖拽且播放时才同步回 State ---
                const tick = () => {
                    if (video && !video.paused && !isDraggingSeek && !video.seeking) {
                        dispatch({ type: "SET_TIME", payload: video.currentTime });
                    }
                };
                app.ticker.add(tick);

            } catch (err) {
                console.error("Init Error:", err);
                setLoadingState('error');
            }
        };

        init();

        return () => {
            if (app) {
                app.destroy(true, { children: true, texture: true });
                appRef.current = null;
            }
        };
    }, [blobUrl]);

    // --- 3. 极速跳转 (Seek) 优化：解决卡死核心逻辑 ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !blobUrl || isPlaying) return;

        // 逻辑：如果是用户在 Timeline 拖拽产生的时间变化
        if (isDraggingSeek) {
            const now = Date.now();
            // 节流：每 60ms 最多允许一次 Seek 请求，且必须等待上一次 Seek 完成
            if (now - lastSeekTimeRef.current > 60 && !video.seeking) {
                video.currentTime = currentTime;
                lastSeekTimeRef.current = now;
            }
        } else {
            // 如果不是拖拽（比如点击跳转），允许较大幅度差异时同步一次
            if (Math.abs(video.currentTime - currentTime) > 0.1) {
                video.currentTime = currentTime;
            }
        }
    }, [currentTime, isPlaying, isDraggingSeek]);

    // --- 4. 播放/暂停控制 ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video || loadingState !== 'ready') return;

        if (isPlaying && video.paused) {
            video.play().catch(() => dispatch({ type: "SET_PLAYING", payload: false }));
        } else if (!isPlaying && !video.paused) {
            video.pause();
        }
    }, [isPlaying, loadingState]);

    // --- 5. 字幕渲染与拖拽逻辑 ---
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;
        const container = app.stage.getChildByLabel("subtitle-layer") as PIXI.Container;
        if (!container) return;

        subtitles.forEach(sub => {
            const isVisible = currentTime >= sub.startTime && currentTime <= sub.endTime;
            let textObj = textMapRef.current.get(sub.id);

            if (!isVisible) {
                if (textObj) textObj.visible = false;
                return;
            }

            if (!textObj) {
                textObj = new PIXI.Text({
                    text: sub.text,
                    style: {
                        fontSize: sub.style.fontSize,
                        fill: sub.style.fill,
                        fontFamily: 'Arial',
                        stroke: { color: '#000000', width: 4 },
                    }
                });
                textObj.anchor.set(0.5);
                textObj.x = sub.style.x || app.screen.width / 2;
                textObj.y = sub.style.y || app.screen.height - 100;

                textObj.eventMode = 'static';
                textObj.cursor = 'pointer';

                let isDraggingSub = false;

                textObj.on('pointerdown', (e) => {
                    isDraggingSub = true;
                    dispatch({ type: "SELECT_SUB", payload: sub.id });
                    e.stopPropagation();
                });

                // 绑定到 stage 以获得更好的平滑度
                app.stage.on('pointermove', (e) => {
                    if (isDraggingSub && textObj) {
                        const newPos = e.getLocalPosition(container);
                        textObj.x = newPos.x;
                        textObj.y = newPos.y;
                    }
                });

                const onDragEnd = () => {
                    if (isDraggingSub) {
                        isDraggingSub = false;
                        dispatch({
                            type: "UPDATE_SUB",
                            payload: {
                                id: sub.id,
                                patch: { x: textObj!.x, y: textObj!.y }
                            }
                        });
                    }
                };

                textObj.on('pointerup', onDragEnd);
                textObj.on('pointerupoutside', onDragEnd);

                container.addChild(textObj);
                textMapRef.current.set(sub.id, textObj);
            }

            // 同步内容
            textObj.visible = true;
            if (textObj.text !== sub.text) textObj.text = sub.text;

            // 只有当不是正在拖拽的对象时，才从全局 state 同步坐标
            if (selectedId !== sub.id) {
                textObj.x = sub.style.x;
                textObj.y = sub.style.y;
            }
        });
    }, [subtitles, currentTime, selectedId]);

    return (
        <div ref={containerRef} className="w-full h-full bg-black relative flex items-center justify-center overflow-hidden">
            {loadingState === 'loading' && (
                <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-black/80 backdrop-blur-sm">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                    <span className="text-white text-sm">正在即时读取视频...</span>
                </div>
            )}

            {loadingState === 'error' && (
                <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-black text-red-500">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <span>视频加载失败</span>
                </div>
            )}

            <video
                ref={videoRef}
                src={blobUrl || undefined}
                preload="auto"
                playsInline
                muted // 建议静音以提高 Seek 性能
                crossOrigin="anonymous"
                className="hidden"
            />

            {/* Pixi 容器 */}
            <div
                id="pixi-inner-wrapper"
                className="w-full h-full flex items-center justify-center pointer-events-auto"
                style={{ position: 'relative' }}
            />
        </div>
    );
}