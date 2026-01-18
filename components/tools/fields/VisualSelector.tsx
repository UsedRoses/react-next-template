"use client";

import * as React from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react";

interface Option {
    label: string;
    value: string;
    icon?: string;
}

interface VisualSelectorProps {
    name: string;
    defaultLabel: string;
    overrideLabel?: string;
    options: Option[];
    gridCols?: 2 | 3 | 4;
}

export default function VisualSelector({
                                   name,
                                   defaultLabel,
                                   overrideLabel,
                                   options,
                                   gridCols = 3,
                               }: VisualSelectorProps) {
    const { control } = useFormContext();
    const { t } = useTranslation('components');
    const label = overrideLabel || t(defaultLabel);

    return (
        <div className="space-y-3">
            <Label className="text-foreground">{label}</Label>

            <Controller
                control={control}
                name={name}
                render={({ field }) => (
                    <div
                        className={cn(
                            "grid gap-3",
                            gridCols === 2 && "grid-cols-2",
                            gridCols === 3 && "grid-cols-2 sm:grid-cols-3",
                            gridCols === 4 && "grid-cols-2 sm:grid-cols-4",
                        )}
                    >
                        {options.map((option) => {
                            const isSelected = field.value === option.value;
                            // 动态获取图标，如果没有则不显示
                            const IconComp = option.icon ? (Icons[option.icon as keyof typeof Icons] as any) : null;

                            return (
                                <div
                                    key={option.value}
                                    onClick={() => field.onChange(option.value)}
                                    className={cn(
                                        "cursor-pointer relative flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200",
                                        // 默认状态：卡片背景，输入框边框
                                        "bg-card text-card-foreground border-input hover:bg-accent hover:text-accent-foreground",
                                        // 选中状态：主色边框，主色文字，微弱的主色背景
                                        isSelected && "border-primary bg-primary/5 text-primary shadow-sm"
                                    )}
                                >
                                    {IconComp && (
                                        <IconComp
                                            className={cn(
                                                "h-6 w-6 mb-1",
                                                isSelected ? "text-primary" : "text-muted-foreground"
                                            )}
                                        />
                                    )}
                                    <span className="text-xs font-medium text-center">
                                        {t(option.label)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            />
        </div>
    );
}