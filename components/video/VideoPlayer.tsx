"use client";

import React, { useEffect, useRef } from "react";
import { useEditorStore } from "@/hooks/use-editor-store";
import { PlayerEngine } from "@/lib/player-engine";

export function VideoPlayer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<PlayerEngine | null>(null);

    // 订阅播放状态用于快捷键 toggle
    const isPlaying = useEditorStore(state => state.isPlaying);
    const setPlaying = useEditorStore(state => state.setPlaying);

    useEffect(() => {
        if (!containerRef.current) return;

        // 1. 初始化引擎
        const engine = new PlayerEngine(containerRef.current);
        engineRef.current = engine;

        // 初始启动
        const { clientWidth, clientHeight } = containerRef.current;
        engine.init(clientWidth, clientHeight);

        // 2. 监听容器大小变化 (ResizeObserver)
        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                engine.resize(width, height);
            }
        });
        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            engine.destroy();
        };
    }, []);

    // 3. 键盘快捷键 (空格播放/暂停)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // 防止在 Input 输入时触发
            if (document.activeElement instanceof HTMLInputElement || document.activeElement instanceof HTMLTextAreaElement) return;

            if (e.code === "Space") {
                e.preventDefault();
                setPlaying(!isPlaying);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, setPlaying]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center relative"
        >
            {/* Pixi Canvas 会被 Append 到这里 */}

            {/* 可选：加载状态或空状态提示 */}
            <div className="absolute pointer-events-none text-muted-foreground/20 text-sm font-mono">
                WORKBENCH PREVIEW
            </div>
        </div>
    );
}