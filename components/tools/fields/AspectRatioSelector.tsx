"use client";

import React from "react";
import { useFormContext, useController } from "react-hook-form";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { CheckCircle2 } from "lucide-react";

interface RatioOption {
    value: string;      // "16:9"
    label?: string;     // 可选，如果不传则直接显示 value
}

interface AspectRatioSelectorProps {
    name: string;
    label?: string;
    options?: RatioOption[];
    required?: boolean;
    onValueChange?: (value: any) => void;
}

export default function AspectRatioSelector({
                                                name,
                                                label,
                                                options = [],
                                                required,
                                                onValueChange
                                            }: AspectRatioSelectorProps) {
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

    return (
        <div className="space-y-3">
            {/* Label 保持与 VisualSelector 一致 */}
            {label && (
                <div className="flex justify-between items-center">
                    <Label className={cn(error && "text-destructive")}>
                        {label} {required && <span className="text-destructive">*</span>}
                    </Label>
                    <span className="text-xs text-muted-foreground font-medium">
                        {field.value}
                    </span>
                </div>
            )}

            {/* 改为 4 列布局 */}
            <div className="grid grid-cols-4 gap-3">
                {options.map((option) => (
                    <RatioCard
                        key={option.value}
                        option={option}
                        isSelected={field.value === option.value}
                        onSelect={() => handleSelect(option.value)}
                    />
                ))}
            </div>

            {error && <p className="text-xs text-destructive mt-1">{error.message}</p>}
        </div>
    );
}

// --- 独立的比例卡片组件 ---
function RatioCard({ option, isSelected, onSelect }: { option: RatioOption, isSelected: boolean, onSelect: () => void }) {

    // 动态计算长宽比样式
    const getRatioStyle = () => {
        if (option.value.includes(':')) {
            const [w, h] = option.value.split(':').map(Number);
            if (!isNaN(w) && !isNaN(h)) {
                return { aspectRatio: `${w}/${h}` };
            }
        }
        return { aspectRatio: '1/1' };
    };

    return (
        <div
            onClick={onSelect}
            className={cn(
                // 容器样式：严格对齐 VisualSelector
                // 使用 rounded-xl, border-2
                "group relative cursor-pointer flex flex-col items-center justify-between p-2 pt-4 pb-2 gap-2 rounded-xl border-2 transition-all duration-200",
                "bg-card hover:border-primary/50", // 基础背景
                isSelected
                    ? "border-primary bg-primary/5 shadow-sm" // 选中状态
                    : "border-border" // 未选中状态
            )}
        >
            {/*
               A. 几何图形区域
               固定高度，内部矩形自适应
            */}
            <div className="h-8 w-full flex items-center justify-center pointer-events-none">
                <div
                    className={cn(
                        "h-full max-w-[80%] rounded-sm border-2 transition-all duration-300",
                        isSelected
                            ? "bg-primary border-primary"  // 选中：实心高亮
                            : "bg-transparent border-muted-foreground/30 group-hover:border-primary/50" // 未选中：空心灰框
                    )}
                    style={getRatioStyle()}
                />
            </div>

            {/* B. 文字标签 (直接显示 value，如 16:9) */}
            <span className={cn(
                "text-xs font-bold text-center",
                isSelected ? "text-primary" : "text-muted-foreground"
            )}>
                {option.value}
            </span>
        </div>
    );
}