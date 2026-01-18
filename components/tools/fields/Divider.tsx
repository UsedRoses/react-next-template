"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { BaseFieldProps } from "@/types/tool-config";

export default function Divider({
                                    defaultLabel,
                                    overrideLabel,
                                    config
                                }: BaseFieldProps) {
    const { t } = useTranslation();

    // 如果数据库里配了 label (如 "Advanced Settings")，就显示文字
    // 否则只显示一条线
    const text = overrideLabel || (defaultLabel ? t(defaultLabel) : null);
    const variant = config.ui_props?.variant || "solid"; // solid, dashed

    return (
        <div className="flex items-center w-full py-4">
            <div className={cn(
                "grow border-t",
                variant === "dashed" ? "border-dashed" : "border-solid",
                "border-border" // 使用全局边框变量
            )}></div>

            {text && (
                <span className="shrink-0 mx-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {text}
                </span>
            )}

            <div className={cn(
                "grow border-t",
                variant === "dashed" ? "border-dashed" : "border-solid",
                "border-border"
            )}></div>
        </div>
    );
}