"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import FileUploader from "./FileUploader";
import { ArrowRight } from "lucide-react";

interface StartEndSelectorProps {
    name: string;

    // --- 开始帧配置 ---
    startLabel?: string;   // 对应 JSON: "startLabel"
    startText?: string;    // 对应 JSON: "startText" (按钮文字)
    startSubtext?: string; // 对应 JSON: "startSubtext"

    // --- 结束帧配置 ---
    endLabel?: string;
    endText?: string;
    endSubtext?: string;
}

export default function StartEndSelector({
                                             name,
                                             startLabel,
                                             startText,
                                             startSubtext,
                                             endLabel,
                                             endText,
                                             endSubtext
                                         }: StartEndSelectorProps) {
    // 统一使用 components 命名空间
    const { t } = useTranslation("components");

    return (
        <div className="w-full">
            <div className="flex items-stretch gap-4">

                {/* 左侧：开始帧 */}
                <div className="flex-1 min-w-0">
                    <FileUploader
                        name={`${name}.start`}
                        // 1. 优先使用数据库传入的 Label，没有则用翻译后的默认值
                        label={startLabel || t("Start Frame")}
                        // 2. 优先使用数据库传入的按钮文案
                        text={startText || t("Upload Start")}
                        // 3. 优先使用数据库传入的副标题
                        subtext={startSubtext || t("First Frame")}
                        maxFiles={1}
                        // 正方形样式
                        aspectRatio="square"
                        className="h-full"
                    />
                </div>

                {/* 中间装饰 */}
                <div className="flex flex-col gap-3 w-8 shrink-0">
                    {/* 占位符：模拟 Label 的高度 (text-sm line-height 约 20px -> h-5) */}
                    <div className="h-5 w-full" aria-hidden="true" />

                    {/* 箭头容器：自动占据剩余空间 (flex-1) 并居中 */}
                    <div className="flex flex-1 items-center justify-center text-muted-foreground/30">
                        <ArrowRight className="w-6 h-6" />
                    </div>
                </div>

                {/* 右侧：结束帧 */}
                <div className="flex-1 min-w-0">
                    <FileUploader
                        name={`${name}.end`}
                        label={endLabel || t("End Frame")}
                        text={endText || t("Upload End")}
                        subtext={endSubtext || t("Last Frame")}
                        maxFiles={1}
                        // 正方形样式
                        aspectRatio="square"
                        className="h-full"
                    />
                </div>
            </div>
        </div>
    );
}