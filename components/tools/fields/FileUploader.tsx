"use client";

import React, { useCallback } from "react";
import { useFormContext, useController } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { X, Image as ImageIcon, UploadCloud, Plus, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/premium-button";
import { useFilePreview } from "@/hooks/use-file-preview"; // 确保路径正确
import { useTranslation } from "react-i18next"; // 1. 引入翻译 Hook

interface FileUploaderProps {
    name: string;
    label?: string;
    maxFiles?: number;
    accept?: Record<string, string[]>;
    icon?: React.ReactNode;
    text?: string;       // 业务主标题 (来自数据库)
    subtext?: string;    // 业务副标题 (来自数据库)
    className?: string;
    aspectRatio?: "video" | "square" | string;
}

export default function FileUploader({
                                         name,
                                         label,
                                         maxFiles = 1,
                                         accept = { "image/*": [] },
                                         icon,
                                         text,
                                         subtext,
                                         className,
                                         aspectRatio = "video",
                                     }: FileUploaderProps) {
    const { t } = useTranslation("components");

    const { control } = useFormContext();
    const { field, fieldState: { error } } = useController({ name, control });

    const isSingle = maxFiles === 1;
    const currentFiles = field.value;

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        if (isSingle) {
            field.onChange(acceptedFiles[0]);
        } else {
            const prev = Array.isArray(currentFiles) ? currentFiles : [];
            const availableSlots = maxFiles - prev.length;
            const newFiles = acceptedFiles.slice(0, availableSlots);
            field.onChange([...prev, ...newFiles]);
        }
    }, [isSingle, currentFiles, maxFiles, field]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxFiles: isSingle ? 1 : maxFiles,
        disabled: !isSingle && Array.isArray(currentFiles) && currentFiles.length >= maxFiles
    });

    // 3. 定义显示文案：优先用传入的 text，否则用 t() 翻译默认值
    const displayText = text || t("Click or Drag to Upload");
    const displaySubtext = subtext || t("Supports images & videos");
    const replaceText = t("Click to Replace");
    const addText = text || t("Add");

    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <div className="flex justify-between items-center">
                    <Label className={cn(error && "text-destructive")}>
                        {label}
                    </Label>
                    {!isSingle && (
                        <span className="text-xs text-muted-foreground">
                            {Array.isArray(currentFiles) ? currentFiles.length : 0} / {maxFiles}
                        </span>
                    )}
                </div>
            )}

            {isSingle ? (
                <SingleUploaderView
                    file={currentFiles}
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    isDragActive={isDragActive}
                    icon={icon}

                    // 4. 传入处理好的文案
                    text={displayText}
                    subtext={displaySubtext}
                    replaceText={replaceText}

                    onRemove={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        field.onChange(null);
                    }}
                    error={!!error}
                    aspectRatio={aspectRatio}
                />
            ) : (
                <div className="grid grid-cols-3 gap-4 sm:grid-cols-4">
                    {Array.isArray(currentFiles) && currentFiles.map((file, idx) => (
                        <div key={idx} className="relative aspect-square group">
                            <PreviewCard file={file} className="w-full h-full rounded-lg border" />
                            <button
                                type="button"
                                onClick={() => {
                                    const newFiles = [...currentFiles];
                                    newFiles.splice(idx, 1);
                                    field.onChange(newFiles);
                                }}
                                className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}

                    {(!Array.isArray(currentFiles) || currentFiles.length < maxFiles) && (
                        <div
                            {...getRootProps()}
                            className={cn(
                                "aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors cursor-pointer bg-muted/30 hover:bg-muted/50 hover:border-primary/50",
                                isDragActive && "border-primary bg-primary/5",
                                error && "border-destructive/50 bg-destructive/5"
                            )}
                        >
                            <input {...getInputProps()} />
                            <Plus className="w-6 h-6 text-muted-foreground mb-2" />
                            <span className="text-xs text-muted-foreground font-medium text-center px-2">
                                {addText}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {error && (
                <p className="text-xs text-destructive animate-in slide-in-from-top-1">
                    {error.message?.toString()}
                </p>
            )}
        </div>
    );
}

// --- 子组件：单文件视图 ---
interface SingleViewProps {
    file: File | string | null;
    aspectRatio: string,
    getRootProps: any;
    getInputProps: any;
    isDragActive: boolean;
    icon?: React.ReactNode;
    text: string;
    subtext: string;
    replaceText: string;
    onRemove: (e: React.MouseEvent) => void;
    error: boolean;
}

function SingleUploaderView({
                                file, aspectRatio, getRootProps, getInputProps, isDragActive, icon, text, subtext, replaceText, onRemove, error
                            }: SingleViewProps) {
    const hasFile = !!file;

    const ratioClass = aspectRatio === "square" ? "aspect-square" :
        aspectRatio === "video" ? "aspect-video" :
            aspectRatio;

    return (
        <div
            {...getRootProps()}
            className={cn(
                "relative flex flex-col items-center justify-center w-full overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer group",
                ratioClass,
                hasFile ? "border-border bg-background" : "border-dashed bg-muted/30 hover:bg-muted/50 hover:border-primary/50",
                isDragActive && "border-primary bg-primary/5 scale-[1.01]",
                error && "border-destructive/50 bg-destructive/5"
            )}
        >
            <input {...getInputProps()} />

            {hasFile ? (
                <>
                    <PreviewCard file={file} className="w-full h-full object-contain" />

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 text-white">
                        <UploadCloud className="w-8 h-8" />
                        <p className="text-sm font-medium">
                            {replaceText} {/* 使用传入的翻译文案 */}
                        </p>

                        <Button
                            variant="destructive"
                            size="layout"
                            onClick={onRemove}
                            className="absolute top-2 right-2 bg-white/10 rounded-full cursor-pointer p-2"
                        >
                            <X className="w-2 h-2" />
                        </Button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center gap-3 text-center p-4">
                    <div className="p-3 rounded-full bg-background border shadow-sm">
                        {icon || <ImageIcon className="w-6 h-6 text-muted-foreground" />}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-foreground">
                            {text}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {subtext}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

// --- 子组件：预览卡片 ---
function PreviewCard({ file, className }: { file: File | string, className?: string }) {
    // 确保 useFilePreview hook 存在且可用
    const src = useFilePreview(file);
    const isVideo = (file instanceof File && file.type.startsWith('video')) || (typeof file === 'string' && file.match(/\.(mp4|webm|mov)$/i));

    if (!src) return null;

    if (isVideo) {
        return (
            <div className={cn("relative flex items-center justify-center bg-black overflow-hidden", className)}>
                <video src={src} className="w-full h-full object-cover opacity-80" muted playsInline />
                <div className="absolute inset-0 flex items-center justify-center">
                    <FileVideo className="w-8 h-8 text-white/50" />
                </div>
            </div>
        );
    }

    return (
        <img
            src={src}
            alt="Preview"
            className={cn("object-cover", className)}
        />
    );
}