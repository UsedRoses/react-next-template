"use client";

import React, { useEffect, useState } from "react";
import {Play, FileVideo, Trash2} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {Button} from "@/components/ui/premium-button";
import {MediaAsset} from "@/app/[lang]/(dashboard)/editing/components/editor-context";

interface MediaItemProps {
    asset: MediaAsset;
    onRemove: () => void;
}

export function MediaItem({ asset, onRemove }: MediaItemProps) {
    const { file, id } = asset;

    const [thumbnail, setThumbnail] = useState<string | null>(null);

    useEffect(() => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const url = URL.createObjectURL(file);

        video.src = url;
        video.currentTime = 1; // 抓取第1秒
        video.muted = true;

        const handleCapture = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext("2d")?.drawImage(video, 0, 0);
            setThumbnail(canvas.toDataURL("image/jpeg"));
            URL.revokeObjectURL(url);
            video.removeEventListener("canplay", handleCapture);
        };

        video.addEventListener("canplay", handleCapture);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="group relative aspect-video bg-muted rounded-xl overflow-hidden border border-border hover:border-primary transition-all cursor-pointer"
                         onDragStart={(e) => {
                             // 传给时间轴：不仅是文件，还有类型
                             e.dataTransfer.setData("mediaType", "video");
                             // 之后会通过全局状态管理 File 对象的引用
                             // 这里简单演示传文件名，实际应用建议传素材 ID
                             e.dataTransfer.setData("mediaId", id);

                             e.dataTransfer.effectAllowed = "copy";
                         }}
                         draggable
                    >
                        {thumbnail ? (
                            <img src={thumbnail} className="w-full h-full object-cover" alt="" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-accent/50">
                                <FileVideo className="w-6 h-6 text-muted-foreground/30" />
                            </div>
                        )}

                        {/* 悬浮遮罩 */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        </div>

                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={(e) => {
                                e.stopPropagation();
                                onRemove();
                            }}
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </Button>

                        {/* 文件名标签 */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/80 via-black/40 to-transparent">
                            <p className="text-[10px] text-white truncate font-medium tracking-tight">
                                {file.name}
                            </p>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-50 break-all">
                    <p className="text-[11px] font-semibold">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}