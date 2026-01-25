"use client";

import React, { useState, useCallback } from "react";
import { useFormContext, useController } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualUploaderProps {
    name: string;
    label?: string;
    accept?: string; // "image/*"
}

export default function VisualUploader({ name, label, accept = "image/*" }: VisualUploaderProps) {
    const { control } = useFormContext();
    const { field, fieldState: { error } } = useController({ name, control });
    const [isUploading, setIsUploading] = useState(false);

    // 模拟上传函数 - 实际项目中请替换为 S3/OSS 上传
    const uploadFile = async (file: File) => {
        setIsUploading(true);
        // await uploadToS3(file)...
        setTimeout(() => {
            const mockUrl = URL.createObjectURL(file);
            field.onChange(mockUrl); // 将 URL 存入表单
            setIsUploading(false);
        }, 1500);
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.[0]) {
            uploadFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { [accept]: [] },
        maxFiles: 1,
        disabled: isUploading || !!field.value
    });

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        field.onChange(""); // 清空
    };

    return (
        <div className="space-y-2">
            {/* 预览状态 */}
            {field.value ? (
                <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-border group bg-muted">
                    <img src={field.value} alt="Uploaded" className="w-full h-full object-contain" />

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-destructive/90 hover:bg-destructive text-white px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 flex items-center gap-2"
                        >
                            <X className="w-4 h-4" /> Remove
                        </button>
                    </div>
                </div>
            ) : (
                /* 上传区域 */
                <div
                    {...getRootProps()}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full aspect-[2/1] rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer",
                        isDragActive
                            ? "border-primary bg-primary/5 scale-[1.01]"
                            : "border-border bg-card hover:bg-muted/50 hover:border-muted-foreground/50",
                        error && "border-destructive/50 bg-destructive/5"
                    )}
                >
                    <input {...getInputProps()} />

                    {isUploading ? (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground animate-pulse">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                            <p className="text-sm font-medium">Uploading...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-center p-4">
                            <div className="p-4 rounded-full bg-muted shadow-inner">
                                <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">
                                    {isDragActive ? "Drop it here!" : "Click or Drag to Upload"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Support JPG, PNG (Max 5MB)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-destructive">{error.message}</p>}
        </div>
    );
}