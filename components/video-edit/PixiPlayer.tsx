"use client";

import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { useEditor } from "./EditorContext";

interface PixiPlayerProps {
    src: string;
    autoPlay?: boolean;
}

export default function PixiPlayer({ src, autoPlay = false }: PixiPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const appRef = useRef<PIXI.Application | null>(null);
    const textureRef = useRef<PIXI.Texture | null>(null);
    const textMapRef = useRef<Map<string, PIXI.Text>>(new Map()); // 缓存 Pixi 文本对象

    const isInitialized = useRef(false);

    const { state, dispatch } = useEditor();
    const { isPlaying, currentTime, subtitles, selectedId, isDraggingSeek } = state;

    // 1. 初始化 Pixi 和 视频
    useEffect(() => {
        if (!containerRef.current || !videoRef.current || isInitialized.current) return;

        const init = async () => {
            isInitialized.current = true;
            const video = videoRef.current!;

            // 等待视频元数据
            if (video.readyState < 1) {
                await new Promise((r) => video.addEventListener("loadedmetadata", r, { once: true }));
            }

            // 设置时长
            dispatch({ type: "SET_DURATION", payload: video.duration });
            if (autoPlay) dispatch({ type: "SET_PLAYING", payload: true });

            // 初始化 Pixi (宽高 = 视频原始分辨率)
            const app = new PIXI.Application();
            await app.init({
                width: video.videoWidth,
                height: video.videoHeight,
                backgroundColor: 0x000000,
                preference: "webgl",
                backgroundAlpha: 0,
            });

            // 样式适配
            app.canvas.style.width = "100%";
            app.canvas.style.height = "100%";
            app.canvas.style.objectFit = "contain";
            app.canvas.style.display = "block";

            containerRef.current!.appendChild(app.canvas);
            appRef.current = app;

            // 视频层
            const texture = PIXI.Texture.from(video);
            textureRef.current = texture;

            const videoSprite = new PIXI.Sprite(texture);
            videoSprite.width = video.videoWidth;
            videoSprite.height = video.videoHeight;
            app.stage.addChild(videoSprite);

            // 字幕层容器
            const subtitleContainer = new PIXI.Container();
            subtitleContainer.label = "subtitle-layer";
            app.stage.addChild(subtitleContainer);

            // --- Ticker 逻辑 ---
            app.ticker.add(() => {
                // A. 视频时间同步
                if (!isDraggingSeek && !video.paused) {
                    // 只有播放时才同步 React 状态
                    dispatch({ type: "SET_TIME", payload: video.currentTime });
                    if (video.ended) dispatch({ type: "SET_PLAYING", payload: false });
                }
            });
        };

        init();

        return () => {
            if (appRef.current) {
                appRef.current.destroy({ removeView: true }, { children: true });
                isInitialized.current = false;
                textMapRef.current.clear();
            }
        };
    }, []);


    // 2. 视频播放控制 (响应 State)
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.error("Auto-play prevented:", error);
                    dispatch({ type: "SET_PLAYING", payload: false });
                });
            }
        } else {
            video.pause();
        }
    }, [isPlaying, dispatch]);

    // 3. 视频时间跳转 (响应 Drag Seek 或 Click Seek)
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        // 允许 0.2s 的误差防止循环抖动
        if (Math.abs(video.currentTime - currentTime) > 0.2) {
            video.currentTime = currentTime;
        }
    }, [currentTime]);


    // 4. 字幕渲染 (核心优化：增量更新)
    useEffect(() => {
        const app = appRef.current;
        if (!app) return;

        // 获取字幕层
        const container = app.stage.children.find(c => c.label === "subtitle-layer") as PIXI.Container;
        if (!container) return;

        // 标记当前依然存在的 ID
        const activeIds = new Set<string>();

        subtitles.forEach((sub) => {
            // 判断是否在时间范围内
            const isVisible = currentTime >= sub.startTime && currentTime <= sub.endTime;

            if (!isVisible) {
                // 如果不可见，但之前画过，就隐藏或移除
                if (textMapRef.current.has(sub.id)) {
                    const textObj = textMapRef.current.get(sub.id)!;
                    textObj.visible = false;
                }
                return;
            }

            activeIds.add(sub.id);
            let textObj = textMapRef.current.get(sub.id);

            // --- A. 如果不存在，创建新的 ---
            if (!textObj) {
                const style = new PIXI.TextStyle({
                    fontSize: sub.style.fontSize,
                    fill: sub.style.fill,
                    stroke: { color: '#000000', width: 4 },
                    dropShadow: true,
                });
                textObj = new PIXI.Text({ text: sub.text, style });

                // 绑定交互事件
                textObj.eventMode = "static";
                textObj.cursor = "grab";
                textObj.label = sub.id; // 绑定 ID

                // 拖拽逻辑闭包
                let dragOffset: { x: number, y: number } | null = null;

                textObj.on("pointerdown", (e) => {
                    textObj!.cursor = "grabbing";
                    dispatch({ type: "SELECT_SUB", payload: sub.id });
                    const pos = e.data.getLocalPosition(textObj!.parent);
                    dragOffset = { x: pos.x - textObj!.x, y: pos.y - textObj!.y };
                });

                textObj.on("globalpointermove", (e) => {
                    if (dragOffset) {
                        const pos = e.data.getLocalPosition(textObj!.parent);
                        // 直接更新 Pixi 对象位置 (高性能)
                        textObj!.x = pos.x - dragOffset.x;
                        textObj!.y = pos.y - dragOffset.y;
                    }
                });

                const onDragEnd = () => {
                    if (dragOffset) {
                        textObj!.cursor = "grab";
                        dragOffset = null;
                        // 拖拽结束，才同步回 React State
                        dispatch({
                            type: "UPDATE_SUB",
                            payload: { id: sub.id, patch: { x: textObj!.x, y: textObj!.y } }
                        });
                    }
                };
                textObj.on("pointerup", onDragEnd);
                textObj.on("pointerupoutside", onDragEnd);

                container.addChild(textObj);
                textMapRef.current.set(sub.id, textObj);
            }

            // --- B. 如果已存在，更新属性 (Diff) ---
            // 只有当 State 里的值和 Pixi 里的值不一样时才更新
            // 注意：拖拽过程中，Pixi 的值是最新的，State 的值是旧的，所以要判断 dragging 状态
            // 这里简化处理：我们信任 React State 是最终真理，但在 pointermove 中我们直接改了 Pixi 对象的 x/y
            // 所以这里需要小心不要把正在拖拽的对象位置重置回去。

            // 简单策略：只要用户在 React 面板改了样式，这里就会更新
            if (textObj.text !== sub.text) textObj.text = sub.text;
            if (textObj.style.fontSize !== sub.style.fontSize) textObj.style.fontSize = sub.style.fontSize;
            if (textObj.style.fill !== sub.style.fill) textObj.style.fill = sub.style.fill;

            // 位置同步：只有当【没有在拖拽】时，才从 State 同步到 Pixi
            // 但由于 pointerdown 时我们只更新内部 offset，这里直接覆盖也是安全的，
            // 除非 React State 此时正好被其他逻辑修改了。
            // 为了安全，我们通常比较一下差距，防止微小抖动
            if (Math.abs(textObj.x - sub.style.x) > 1) textObj.x = sub.style.x;
            if (Math.abs(textObj.y - sub.style.y) > 1) textObj.y = sub.style.y;

            textObj.visible = true;
            textObj.alpha = selectedId === sub.id ? 1.0 : 0.8; // 选中高亮
        });

    }, [subtitles, currentTime, selectedId]); // 依赖项

    return (
        <div className="relative w-full h-full flex justify-center items-center">
            {/* 隐藏的 Video 元素，作为 Pixi 的源 */}
            <video
                ref={videoRef}
                src={src}
                crossOrigin="anonymous"
                playsInline
                className="absolute top-0 left-0 w-full h-full opacity-0 pointer-events-none -z-10"
            />
            {/* Pixi 容器 */}
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}