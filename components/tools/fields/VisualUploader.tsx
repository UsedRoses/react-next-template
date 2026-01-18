"use client";

import { useCallback, useState, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface VisualUploaderProps {
    name: string;
    defaultLabel: string;
    overrideLabel?: string;
    accept?: Record<string, string[]>;
}

export default function VisualUploader({
                                   name,
                                   defaultLabel,
                                   overrideLabel,
                                   accept = { "image/*": [] },
                               }: VisualUploaderProps) {
    const { control, watch } = useFormContext();
    const { t } = useTranslation('components');
    const [preview, setPreview] = useState<string | null>(null);

    const label = overrideLabel || t(defaultLabel);
    const fieldValue = watch(name);

    // 清理预览 URL 以防内存泄漏
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    return (
        <div className="space-y-3">
            <Label className="text-foreground">{label}</Label>

            <Controller
                control={control}
                name={name}
                render={({ field: { onChange, value } }) => {
                    const onDrop = useCallback((acceptedFiles: File[]) => {
                        const file = acceptedFiles[0];
                        if (file) {
                            onChange(file);
                            setPreview(URL.createObjectURL(file));
                        }
                    }, [onChange]);

                    const { getRootProps, getInputProps, isDragActive } = useDropzone({
                        onDrop,
                        accept,
                        maxFiles: 1,
                        multiple: false,
                    });

                    // 状态 A: 已有图片预览
                    if (preview || (value && typeof value === 'string')) {
                        return (
                            <div className="relative group w-full aspect-video rounded-lg overflow-hidden border border-border bg-muted/30">
                                <img
                                    src={preview || value}
                                    alt="Preview"
                                    className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onChange(null);
                                            setPreview(null);
                                        }}
                                        className="p-2 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    }

                    // 状态 B: 待上传
                    return (
                        <div
                            {...getRootProps()}
                            className={cn(
                                "relative flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed transition-all cursor-pointer",
                                // 默认状态：Muted 背景，Muted 边框
                                "bg-muted/30 border-muted-foreground/25 hover:bg-muted/50 hover:border-muted-foreground/50",
                                // 拖拽激活状态：Primary 边框，Primary 背景
                                isDragActive && "border-primary bg-primary/5"
                            )}
                        >
                            <input {...getInputProps()} />
                            <div className="flex flex-col items-center gap-2 text-center p-4">
                                <div className={cn(
                                    "p-3 rounded-full bg-background border border-border shadow-sm",
                                    isDragActive && "text-primary border-primary"
                                )}>
                                    <UploadCloud className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-foreground">
                                        {t("Click to upload or drag and drop")}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        JPG, PNG, WEBP (Max 5MB)
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                }}
            />
        </div>
    );
}