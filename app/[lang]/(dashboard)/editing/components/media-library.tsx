"use client";

import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ImageIcon, UploadCloud, Film } from "lucide-react";
import { Button } from "@/components/ui/premium-button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { MediaItem } from "./media-item";
import { MediaAsset, useEditor } from "@/app/[lang]/(dashboard)/editing/components/editor-context";
import {getVideoMetadata} from "@/lib/video";

const MAX_FILE_SIZE = 1024 * 1024 * 1024; // 1GB

export function MediaLibrary() {
    const { t } = useTranslation("editing");
    const { state, dispatch } = useEditor();
    const { mediaList } = state;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // --- 2. 行为：处理文件上传 ---
    const handleFiles = async (files: FileList | null) => {
        if (!files) return;

        for (const file of Array.from(files)) {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`${file.name}: ${t("File is too large (max 1GB)")}`);
                return;
            }
            if (!file.type.startsWith("video/")) {
                return;
            }

            const { duration } = await getVideoMetadata(file);

            // 构造素材对象
            const asset: MediaAsset = {
                id: crypto.randomUUID(),
                file: file,
                type: 'video',
                duration
            };

            // 3. 事件驱动：发出“添加素材”的指令
            dispatch({ type: "ADD_ASSET", payload: asset });
        }

        // 清空 input，保证同一个文件删了能再传
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // --- 4. 行为：删除素材 ---
    const handleRemoveFile = (id: string) => {
        // 同时清理素材库和轨道上的片段
        dispatch({ type: "REMOVE_ASSET", payload: id });
        dispatch({ type: "REMOVE_ASSETS_CLIPS", payload: id });
    };

    // --- 5. 拖拽 UI 状态 (这是局部 UI 状态，保留 useState 是正确的) ---
    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.types.includes("Files")) {
            setIsDragging(true);
        }
    };

    const onDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    return (
        <aside
            className={`w-72 flex flex-col shrink-0 transition-all duration-200 h-full ${
                isDragging ? 'bg-card/50' : ''
            }`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            {/* 标题区域 */}
            <div className="p-4 pb-2 shrink-0">

                {/* 隐藏的真实 Input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*"
                    multiple
                    onChange={(e) => {
                        handleFiles(e.target.files);
                        e.target.value = "";
                    }}
                />

                {/* 上传交互区域：点击触发 Input，同时也是拖拽响应区 */}
                <Button
                    variant="outline"
                    className="cursor-pointer w-full h-24 flex flex-col gap-2 border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <UploadCloud className={`w-6 h-6 transition-transform ${isDragging ? 'scale-110 text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                    <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground font-normal">{t("Click or drag video here")}</span>
                    </div>
                </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-4 pt-2 relative min-h-50">
                    {mediaList.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {mediaList.map((asset) => (
                                <MediaItem
                                    key={asset.id}
                                    asset={asset} // 传递整个 asset 对象
                                    onRemove={() => handleRemoveFile(asset.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/40">
                            <ImageIcon className="w-10 h-10 mb-3 opacity-20" />
                            <p className="text-[11px] font-medium uppercase tracking-wider text-center">
                                {t("No assets yet")}
                            </p>
                        </div>
                    )}

                    {/* 拖拽态覆盖层提示 */}
                    {isDragging && (
                        <div className="absolute inset-0 z-50 bg-primary/10 backdrop-blur-[1px] pointer-events-none flex items-center justify-center p-4">
                            <div className="w-full h-full border-2 border-dashed border-primary rounded-xl flex items-center justify-center animate-in fade-in zoom-in duration-200">
                                <span className="text-xs font-bold text-primary bg-background px-3 py-1.5 rounded-full shadow-sm">
                                    {t("Drop files here to upload")}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </aside>
    );
}