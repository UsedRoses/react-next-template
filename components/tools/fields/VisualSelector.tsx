"use client";

import React, { useRef, useState } from "react";
import { useFormContext, useController } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VisualOption {
    value: string;
    label: string;
    image?: string;
    video?: string;
    badge?: string; // 如 "Pro", "New"
    disabled?: boolean;
}
// 修改 Props 定义，继承 BaseFieldProps 或手动添加 onValueChange
interface VisualSelectorProps {
    name: string;
    label?: string;
    options?: any[];
    required?: boolean;
    // 关键：接收父组件传来的回调
    onValueChange?: (value: any) => void;
}

export default function VisualSelector({ name, label, options = [], required, onValueChange }: VisualSelectorProps) {
    const { control } = useFormContext();
    const { field, fieldState: { error } } = useController({
        name,
        control,
        rules: { required }
    });

    // 处理选择逻辑
    const handleSelect = (newValue: string) => {
        // 1. 更新 React Hook Form 内部状态
        field.onChange(newValue);

        // 2. 触发父组件的联动逻辑 (如果有)
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    return (
        <div className="space-y-3">
            {/* Label 部分保持不变 */}
            {label && (
                <div className="flex justify-between">
                    <Label className={cn(error && "text-destructive")}>
                        {label} {required && <span className="text-destructive">*</span>}
                    </Label>
                    <span className="text-xs text-muted-foreground font-medium">
                        {options.find(o => o.value === field.value)?.label}
                    </span>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3">
                {options.map((option) => (
                    <OptionCard
                        key={option.value}
                        option={option}
                        isSelected={field.value === option.value}
                        // 修改这里：调用 handleSelect
                        onSelect={() => handleSelect(option.value)}
                    />
                ))}
            </div>

            {error && <p className="text-xs text-destructive mt-1">{error.message}</p>}
        </div>
    );
}

// 独立的卡片组件，处理 Hover Video 逻辑
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
                "relative group cursor-pointer rounded-xl border-2 overflow-hidden transition-all duration-200 aspect-[16/9] bg-muted",
                isSelected
                    ? "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                    : "border-transparent hover:border-border ring-1 ring-border",
                option.disabled && "opacity-50 cursor-not-allowed grayscale"
            )}
        >
            {/* 背景层：图片 */}
            {option.image && (
                <img
                    src={option.image}
                    alt={option.label}
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-transform duration-700",
                        isHovering && !option.disabled ? "scale-110" : "scale-100"
                    )}
                />
            )}

            {/* 背景层：视频 (Hover时显示) */}
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

            {/* 遮罩层：选中或未选中 */}
            <div className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity",
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

            {/* Badge */}
            {option.badge && (
                <div className="absolute top-2 left-2 z-20">
                    <Badge variant="secondary" className="text-[10px] px-1.5 h-5 bg-background/80 backdrop-blur text-foreground">
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