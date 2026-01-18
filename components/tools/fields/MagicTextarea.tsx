"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface MagicTextareaProps {
    name: string;
    defaultLabel: string;
    overrideLabel?: string; // 数据库里的翻译覆盖
    placeholder?: string;
    required?: boolean;
    rows?: number;
}

export default function MagicTextarea({
                                  name,
                                  defaultLabel,
                                  overrideLabel,
                                  placeholder,
                                  required,
                                  rows = 4,
                              }: MagicTextareaProps) {
    const { register, formState: { errors } } = useFormContext();
    const { t } = useTranslation('components');

    const label = overrideLabel || t(defaultLabel);
    const error = errors[name];

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label
                    htmlFor={name}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        error ? "text-destructive" : "text-foreground"
                    )}
                >
                    {label}
                    {required && <span className="ml-1 text-destructive">*</span>}
                </Label>
            </div>

            <Textarea
                id={name}
                {...register(name, { required })}
                rows={rows}
                placeholder={t(placeholder || "")}
                className={cn(
                    // 基础样式：使用 bg-input 或 bg-card 都可以，这里用 bg-card 增加层次感
                    "resize-none transition-all duration-200",
                    "bg-card text-card-foreground",
                    "border-input placeholder:text-muted-foreground",
                    "focus-visible:ring-ring focus-visible:ring-offset-background",
                    // 错误状态：严格使用 destructive 变量
                    error && "border-destructive focus-visible:ring-destructive"
                )}
            />

            {error && (
                <p className="text-[0.8rem] font-medium text-destructive">
                    {String(error.message || t("This field is required"))}
                </p>
            )}
        </div>
    );
}