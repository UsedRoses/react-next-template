"use client";

import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { useEditor } from "./EditorContext";
import { Loader2, Upload, AlertCircle } from "lucide-react";

interface PixiPlayerProps {
    src?: string;
    autoPlay?: boolean;
}

export default function PixiPlayer({ src, autoPlay = false }: PixiPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const textMapRef = useRef<Map<string, PIXI.Text>>(new Map());

    const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [canvasStyle, setCanvasStyle] = useState<React.CSSProperties>({});

    const isSeekingRef = useRef(false);
    const pendingSeekTimeRef = useRef<number | null>(null);

    const { state, dispatch } = useEditor();
    const { isPlaying, currentTime, subtitles, selectedId, isDraggingSeek } = state;

    // 1. 处理空状态 (如果没有 src，直接返回上传提示，不需要渲染 Pixi 容器)
    if (!src) {
        return (
            <div className="w-full h-full flex flex-col justify-center items-center bg-slate-900 text-slate-500 gap-4 border-2 border-dashed border-slate-700 rounded-lg">
                <Upload className="w-12 h-12" />
                <p>请上传或传入视频源</p>
            </div>
        );
    }

    // 2. 预加载视频
    useEffect(() => {
        let active = true;
        setLoadingState('loading');
        setBlobUrl(null);

        const loadVideo = async () => {
            try {
                const response = await fetch(src);
                if (!response.ok) throw new Error("Video fetch failed");

                const blob = await response.blob();
                if (!active) return;

                const objectUrl = URL.createObjectURL(blob);
                setBlobUrl(objectUrl);
                // 注意：这里不设为 ready，等 Pixi 初始化完再设
            } catch (err) {
                console.error(err);
                if (active) setLoadingState('error');
            }
        };

        loadVideo();
        return () => {
            active = false;
            if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
    }, [src]);

    // 3. 初始化 Pixi
    useEffect(() => {
        // 必须等待 DOM 挂载且 Blob 准备好
        if (!containerRef.current || !videoRef.current || !blobUrl) return;
        if (appRef.current) return;

        const init = async () => {
            const video = videoRef.current!;

            // 等待元数据加载
            if (video.readyState < 1) {
                await new Promise((r) => video.addEventListener("loadedmetadata", r, { once: true }));
            }

            // --- 关键修复：再次检查 DOM 是否还在 ---
            // 因为 await 期间组件可能卸载或重绘，导致 ref 变空
            if (!containerRef.current || !videoRef.current) return;

            dispatch({ type: "SET_DURATION", payload: video.duration });

            // 计算尺寸
            const container = containerRef.current;
            const contW = container.clientWidth; // 现在这里安全了
            const contH = container.clientHeight;

            // 防止除以 0 错误
            if (contW === 0 || contH === 0) return;

            const vidRatio = video.videoWidth / video.videoHeight;
            const contRatio = contW / contH;

            let finalW, finalH;
            if (contRatio > vidRatio) {
                finalH = contH;
                finalW = contH * vidRatio;
            } else {
                finalW = contW;
                finalH = contW / vidRatio;
            }

            setCanvasStyle({
                width: finalW,
                height: finalH,
                marginTop: (contH - finalH) / 2,
                marginLeft: (contW - finalW) / 2,
            });

            // 初始化 Pixi
            const app = new PIXI.Application();
            await app.init({
                width: video.videoWidth,
                height: video.videoHeight,
                backgroundColor: 0x000000,
                preference: "webgl",
                backgroundAlpha: 0,
            });

            Object.assign(app.canvas.style, {
                width: "100%",
                height: "100%",
                display: "block"
            });

            const innerWrapper = document.getElementById("pixi-inner-wrapper");
            if(innerWrapper) innerWrapper.appendChild(app.canvas);

            appRef.current = app;

            const texture = PIXI.Texture.from(video);
            const videoSprite = new PIXI.Sprite(texture);
            videoSprite.width = video.videoWidth;
            videoSprite.height = video.videoHeight;
            app.stage.addChild(videoSprite);

            const subtitleContainer = new PIXI.Container();
            subtitleContainer.label = "subtitle-layer";
            app.stage.addChild(subtitleContainer);

            setLoadingState('ready'); // 初始化完成，移除 Loading 遮罩

            // 自动播放
            if (autoPlay) {
                dispatch({ type: "SET_PLAYING", payload: true });
            }

            // Ticker
            video.addEventListener('seeking', () => { isSeekingRef.current = true; });
            video.addEventListener('seeked', () => {
                isSeekingRef.current = false;
                if (pendingSeekTimeRef.current !== null) {
                    const t = pendingSeekTimeRef.current;
                    pendingSeekTimeRef.current = null;
                    if (Math.abs(video.currentTime - t) > 0.1) video.currentTime = t;
                }
            });

            app.ticker.add(() => {
                if (!isDraggingSeek && !video.paused && !isSeekingRef.current) {
                    dispatch({ type: "SET_TIME", payload: video.currentTime });
                    if (video.ended) dispatch({ type: "SET_PLAYING", payload: false });
                }
            });
        };

        init();

        return () => {
            if (appRef.current) {
                appRef.current.destroy({ removeView: true }, { children: true });
                appRef.current = null;
                textMapRef.current.clear();
            }
        };
    }, [blobUrl]); // 尺寸依赖容器，但简单起见只依赖 blobUrl 触发一次

    // 4. 智能跳转
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !blobUrl) return;
        if (!video.paused && Math.abs(video.currentTime - currentTime) < 0.2) return;

        if (isSeekingRef.current) {
            pendingSeekTimeRef.current = currentTime;
        } else {
            video.currentTime = currentTime;
        }
    }, [currentTime, blobUrl]);

    // 5. 播放控制
    useEffect(() => {
        const video = videoRef.current;
        if (!video || loadingState !== 'ready') return;

        if (isPlaying) {
            const playPromise = video.play();

            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    // 核心修复：捕获 "NotAllowedError"
                    if (error.name === 'NotAllowedError') {
                        console.log("Autoplay blocked by browser, switching to muted mode.");
                        // 1. 静音
                        video.muted = true;
                        // 2. 再次尝试播放
                        video.play().catch((e) => {
                            console.error("Autoplay failed completely:", e);
                            // 实在不行，就把状态改为暂停，让用户自己点
                            dispatch({ type: "SET_PLAYING", payload: false });
                        });
                    } else {
                        // 其他错误（如资源加载失败），直接停止
                        console.error("Playback failed:", error);
                        dispatch({ type: "SET_PLAYING", payload: false });
                    }
                });
            }
        } else {
            video.pause();
        }
    }, [isPlaying, loadingState]);

    // 6. 字幕渲染
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;
        const container = app.stage.children.find(c => c.label === "subtitle-layer") as PIXI.Container;
        if (!container) return;

        subtitles.forEach((sub) => {
            const isVisible = currentTime >= sub.startTime && currentTime <= sub.endTime;
            let textObj = textMapRef.current.get(sub.id);

            if (!isVisible) {
                if (textObj) textObj.visible = false;
                return;
            }

            if (!textObj) {
                const style = new PIXI.TextStyle({
                    fontSize: sub.style.fontSize,
                    fill: sub.style.fill,
                    fontFamily: 'Arial',
                    stroke: { color: '#000000', width: 4 },
                    dropShadow: true,
                });
                textObj = new PIXI.Text({ text: sub.text, style });
                textObj.label = sub.id;
                textObj.eventMode = "static";
                textObj.cursor = "grab";

                let dragData: any = null;
                let dragOffset = { x: 0, y: 0 };

                textObj.on("pointerdown", (e) => {
                    textObj!.cursor = "grabbing";
                    textObj!.alpha = 0.7;
                    dispatch({ type: "SELECT_SUB", payload: sub.id });
                    dragData = e.data;
                    const localPos = textObj!.position;
                    const globalPos = dragData.getLocalPosition(textObj!.parent);
                    dragOffset = { x: globalPos.x - localPos.x, y: globalPos.y - localPos.y };

                    app.stage.eventMode = 'static';
                    app.stage.on("globalpointermove", onMove);
                    app.stage.on("pointerup", onUp);
                    app.stage.on("pointerupoutside", onUp);
                });

                const onMove = (e: any) => {
                    if (dragData) {
                        const newPos = dragData.getLocalPosition(textObj!.parent);
                        textObj!.x = newPos.x - dragOffset.x;
                        textObj!.y = newPos.y - dragOffset.y;
                    }
                };

                const onUp = () => {
                    textObj!.cursor = "grab";
                    textObj!.alpha = 1;
                    dragData = null;
                    app.stage.off("globalpointermove", onMove);
                    app.stage.off("pointerup", onUp);
                    app.stage.off("pointerupoutside", onUp);
                    dispatch({
                        type: "UPDATE_SUB",
                        payload: { id: sub.id, patch: { x: textObj!.x, y: textObj!.y } }
                    });
                };
                container.addChild(textObj);
                textMapRef.current.set(sub.id, textObj);
            }

            // Sync
            if (textObj.text !== sub.text) textObj.text = sub.text;
            if (textObj.style.fontSize !== sub.style.fontSize) textObj.style.fontSize = sub.style.fontSize;
            if (textObj.style.fill !== sub.style.fill) textObj.style.fill = sub.style.fill;
            if (selectedId !== sub.id) {
                if (Math.abs(textObj.x - sub.style.x) > 0.1) textObj.x = sub.style.x;
                if (Math.abs(textObj.y - sub.style.y) > 0.1) textObj.y = sub.style.y;
            }
            textObj.visible = true;
        });
    }, [subtitles, currentTime, selectedId]);

    // --------------------------------------------------------
    // 7. 渲染结构 (关键：始终渲染容器，Overlay 处理 Loading)
    // --------------------------------------------------------
    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-black relative overflow-hidden"
        >
            {/* Loading Overlay */}
            {loadingState === 'loading' && (
                <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-black/80 text-white gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="text-sm text-gray-400">Loading Video...</p>
                </div>
            )}

            {/* Error Overlay */}
            {loadingState === 'error' && (
                <div className="absolute inset-0 z-50 flex flex-col justify-center items-center bg-black/90 text-red-500 gap-4">
                    <AlertCircle className="w-10 h-10" />
                    <p>视频加载失败，请检查网络或跨域设置</p>
                </div>
            )}

            {/* Video Element */}
            <video
                ref={videoRef}
                // 修复 src 为空的警告
                {...(blobUrl ? { src: blobUrl } : {})}
                crossOrigin="anonymous"
                playsInline
                className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none -z-10"
            />

            {/* Pixi Wrapper (由 JS 控制尺寸) */}
            <div
                id="pixi-inner-wrapper"
                style={canvasStyle}
                className="relative"
            />
        </div>
    );
}