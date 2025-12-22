"use client";

import React from "react";
import { EditorProvider, Subtitle } from "./EditorContext";
import PixiPlayer from "./PixiPlayer";
import Controls from "./Controls";

interface VideoEditorProps {
    src: string; // 视频地址
    subtitles: Subtitle[]; // 初始字幕数据
    autoPlay?: boolean; // 是否自动播放
}

export default function VideoEditor({ src, subtitles, autoPlay = false }: VideoEditorProps) {
    return (
        <div className="flex flex-col h-full">
            {/* Provider 包裹所有子组件，共享状态 */}
            <EditorProvider initialSubtitles={subtitles}>

                {/* 上半部分：Pixi 播放器 */}
                <div className="flex-1 min-h-[400px] relative">
                    <PixiPlayer src={src} autoPlay={autoPlay} />
                </div>

                {/* 下半部分：控制条 */}
                <Controls />

            </EditorProvider>
        </div>
    );
}