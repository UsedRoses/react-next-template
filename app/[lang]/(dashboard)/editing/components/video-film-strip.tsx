"use client";

import React, { useEffect, useState, memo } from "react";

interface Props {
    file: File;
    width: number; // 像素宽度
}

const FRAME_WIDTH = 160; // 每张缩略图的显示宽度（像素）

export const VideoFilmstrip = memo(({ file, width }: Props) => {
    const [frames, setFrames] = useState<string[]>([]);

    useEffect(() => {
        let isMounted = true;
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const url = URL.createObjectURL(file);

        // 计算需要提取多少张图来填满宽度
        const frameCount = Math.max(1, Math.ceil(width / FRAME_WIDTH));

        video.src = url;
        video.muted = true;

        const extractFrames = async () => {
            await new Promise((resolve) => (video.onloadedmetadata = resolve));

            const duration = video.duration;
            const tempFrames: string[] = [];

            // 设置画布尺寸（取低分辨率以保证性能）
            canvas.width = 100;
            canvas.height = (video.videoHeight / video.videoWidth) * 100;

            for (let i = 0; i < frameCount; i++) {
                if (!isMounted) break;

                // 计算每一帧的时间点
                const time = (i / frameCount) * duration;
                video.currentTime = time;

                await new Promise((resolve) => (video.onseeked = resolve));

                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                tempFrames.push(canvas.toDataURL("image/jpeg", 0.8));
            }

            if (isMounted) setFrames(tempFrames);
            URL.revokeObjectURL(url);
            video.remove();
        };

        extractFrames();

        return () => {
            isMounted = false;
            URL.revokeObjectURL(url);
        };
    }, [file, width]);

    return (
        <div className="flex h-full w-full overflow-hidden select-none pointer-events-none">
            {frames.length > 0 ? (
                frames.map((src, i) => (
                    <img
                        key={i}
                        src={src}
                        className="h-full shrink-0 object-cover"
                        style={{ width: FRAME_WIDTH }}
                        alt=""
                    />
                ))
            ) : (
                // 未加载完成时的底色
                <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                    <div className="w-full h-full bg-[linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] bg-size-[200%_100%] animate-shimmer" />
                </div>
            )}
        </div>
    );
});

VideoFilmstrip.displayName = "VideoFilmstrip";