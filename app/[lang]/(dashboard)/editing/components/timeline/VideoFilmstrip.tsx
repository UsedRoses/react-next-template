"use client";

import React, { useEffect, memo, useState, useRef } from "react";
import { VideoThumbnailService } from "@/lib/VideoThumbnailService";

interface VideoFilmstripProps {
    file: File;
    width: number;
}

export const VideoFilmstrip = memo(({ file, width }: VideoFilmstripProps) => {
    const [filmstripUrl, setFilmstripUrl] = useState<string | null>(null);

    useEffect(() => {
        // 1. 基础条件过滤
        if (width <= 0) return;

        let isMounted = true;

        // 2. 直接调用。Service 内部现在已经处理了所有“避免重复”的逻辑。
        // 即便组件因为父级重绘触发了多次 useEffect，Service 也会合并为一个任务。
        VideoThumbnailService.getInstance()
            .generateFilmstrip(file, width)
            .then((url) => {
                if (isMounted) {
                    setFilmstripUrl(url);
                }
            })
            .catch((err) => {
                // 生产环境建议通过 Sentry 或日志服务上报
                console.error("[Filmstrip] Error:", err);
            });

        return () => {
            // 卸载标记，防止在异步返回后尝试更新已销毁的组件状态
            isMounted = false;
        };
    }, [file]);

    return (
        <div className="w-full h-full bg-muted/5">
            {filmstripUrl ? (
                <div
                    className="w-full h-full bg-no-repeat bg-cover"
                    style={{
                        backgroundImage: `url(${filmstripUrl})`,
                        backgroundSize: '100% 100%'
                    }}
                />
            ) : (
                <div className="absolute inset-0 bg-primary/5 animate-pulse" />
            )}
        </div>
    );
});

VideoFilmstrip.displayName = "VideoFilmstrip";