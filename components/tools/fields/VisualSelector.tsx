"use client";

import React, { useRef, useState } from "react";
import { useFormContext, useController } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface VisualOption {
    value: string;
    label: string;
    image?: string;
    video?: string;
    badge?: string;
    disabled?: boolean;
}

interface VisualSelectorProps {
    name: string;
    label?: string;
    options?: VisualOption[];
    required?: boolean;
    onValueChange?: (value: any) => void;
}

export default function VisualSelector({
                                           name,
                                           label,
                                           options = [],
                                           required,
                                           onValueChange
                                       }: VisualSelectorProps) {
    const { t } = useTranslation("components"); // 仅用于翻译系统级提示(如必填)
    const { control } = useFormContext();
    const { field, fieldState: { error } } = useController({
        name,
        control,
        rules: { required }
    });

    const handleSelect = (newValue: string) => {
        field.onChange(newValue);
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    // 获取当前选中的 label 用于右上角显示
    const currentSelection = options.find(o => o.value === field.value);

    return (
        <div className="space-y-3">
            {label && (
                <div className="flex justify-between items-center">
                    <Label className={cn(error && "text-destructive")}>
                        {label} {required && <span className="text-destructive">*</span>}
                    </Label>
                    {/* 直接显示选中的 Label，不翻译 */}
                    <span className="text-xs text-muted-foreground font-medium">
                        {currentSelection?.label}
                    </span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {options.map((option) => (
                    <OptionCard
                        key={option.value}
                        option={option}
                        isSelected={field.value === option.value}
                        onSelect={() => handleSelect(option.value)}
                    />
                ))}
            </div>

            {error && (
                <p className="text-xs text-destructive mt-1">
                    {/* 错误信息保留翻译兜底 */}
                    {String(error.message || t("Required"))}
                </p>
            )}
        </div>
    );
}

// 独立的卡片组件
function OptionCard({ option, isSelected, onSelect }: { option: VisualOption, isSelected: boolean, onSelect: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovering, setIsHovering] = useState(false);

    const handleMouseEnter = () => {
        setIsHovering(true);
        if (option.video && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => {});
        }
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
        if (option.video && videoRef.current) {
            videoRef.current.pause();
        }
    };

    return (
        <div
            onClick={() => !option.disabled && onSelect()}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative group cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 aspect-video bg-muted",
                isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                    : "border-border hover:border-primary/50", // 简化 hover 逻辑
                option.disabled && "opacity-50 cursor-not-allowed grayscale"
            )}
        >
            {/* 背景层：图片 */}
            {option.image && (
                <img
                    src={option.image}
                    alt={option.label} // 直接使用数据库配置的 Label
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-transform duration-700",
                        isHovering && !option.disabled ? "scale-110" : "scale-100"
                    )}
                />
            )}

            {/* 背景层：视频 */}
            {option.video && (
                <video
                    ref={videoRef}
                    src={option.video}
                    muted
                    loop
                    playsInline
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                        isHovering ? "opacity-100" : "opacity-0"
                    )}
                />
            )}

            {/* 遮罩层 */}
            <div className={cn(
                "absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent transition-opacity",
                isSelected ? "opacity-80" : "opacity-60 group-hover:opacity-40"
            )} />

            {/* 内容层 */}
            <div className="absolute inset-x-0 bottom-0 p-3 z-10 flex items-end justify-between">
                <div>
                    <div className="text-white font-bold text-sm leading-tight drop-shadow-md">
                        {option.label}
                    </div>
                </div>

                {isSelected && (
                    <div className="bg-primary text-primary-foreground rounded-full p-0.5 shadow-sm">
                        <CheckCircle2 className="w-4 h-4" />
                    </div>
                )}
            </div>

            {option.badge && (
                <div className="absolute top-2 left-2 z-20">
                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-background/80 backdrop-blur text-foreground border-white/10">
                        {option.badge}
                    </Badge>
                </div>
            )}

            {/* Disabled Lock */}
            {option.disabled && (
                <div className="absolute top-2 right-2 z-20">
                    <Lock className="w-4 h-4 text-white/70" />
                </div>
            )}
        </div>
    );
}