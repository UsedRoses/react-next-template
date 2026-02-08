"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/premium-button";
import { Eraser } from "lucide-react";
import { cn } from "@/lib/utils";

interface MagicTextareaProps {
    name: string;
    // 业务配置 (来自数据库)
    label?: string;
    placeholder?: string;

    // 功能配置
    required?: boolean;
    rows?: number;
    maxLength?: number; // 最大字数限制
    showCount?: boolean; // 是否显示字数
    allowClear?: boolean; // 是否允许一键清空
    className?: string;
}

export default function MagicTextarea({
                                          name,
                                          label,
                                          placeholder,
                                          required,
                                          rows = 4,
                                          maxLength = 2000, // 默认给个最大值，防止溢出
                                          showCount = true,
                                          allowClear = true,
                                          className,
                                      }: MagicTextareaProps) {
    const { register, setValue, control, formState: { errors } } = useFormContext();
    const { t } = useTranslation('components');

    // 1. 实时监听输入值，用于字数统计和清空按钮显隐
    const value = useWatch({
        control,
        name,
        defaultValue: ""
    });

    const currentLength = value ? String(value).length : 0;
    const error = errors[name];

    // 2. 处理文案 (数据库优先 -> i18n 兜底)
    const displayLabel = label || t("textarea.default_label");
    const displayPlaceholder = placeholder || t("textarea.default_placeholder");

    // 3. 清空处理
    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        setValue(name, "", { shouldValidate: true, shouldDirty: true });
    };

    return (
        <div className={cn("space-y-2", className)}>
            {/* Header: Label + Clear Button */}
            <div className="flex justify-between items-center min-h-5">
                <Label
                    htmlFor={name}
                    className={cn(
                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                        error ? "text-destructive" : "text-foreground"
                    )}
                >
                    {displayLabel}
                    {required && <span className="ml-1 text-destructive">*</span>}
                </Label>

                {/* 一键清空按钮 (只有当有内容时显示) */}
                {allowClear && currentLength > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        className="h-5 text-xs hover:text-destructive"
                        title={t("Clear content")}
                    >
                        <Eraser className="w-3 h-3 mr-1" />
                        {t("Clear")}
                    </Button>
                )}
            </div>

            {/* Input Area */}
            <div className="relative">
                <Textarea
                    id={name}
                    {...register(name, {
                        required,
                        maxLength: {
                            value: maxLength,
                            message: t("Max length exceeded")
                        }
                    })}
                    rows={rows}
                    placeholder={displayPlaceholder}
                    className={cn(
                        "resize-none transition-all duration-200 bg-card text-card-foreground",
                        "focus-visible:ring-primary/20", // 聚焦时更柔和的光晕
                        error && "border-destructive focus-visible:ring-destructive"
                    )}
                />
            </div>

            {/* Footer: Error Message + Char Count */}
            <div className="flex justify-between items-start text-[0.8rem]">
                {/* 左侧：错误信息 */}
                <div className="flex-1 mr-2">
                    {error && (
                        <p className="font-medium text-destructive animate-in slide-in-from-top-1">
                            {String(error.message || t("Required"))}
                        </p>
                    )}
                </div>

                {/* 右侧：字数统计 */}
                {showCount && (
                    <div className={cn(
                        "font-mono text-xs transition-colors whitespace-nowrap",
                        currentLength > maxLength ? "text-destructive" : "text-muted-foreground/60"
                    )}>
                        {currentLength} / {maxLength}
                    </div>
                )}
            </div>
        </div>
    );
}