"use client";

import { useTranslation } from "react-i18next";
import { Sparkles, PlayCircle, Download } from "lucide-react";

interface ResultViewerProps {
    isLoading?: boolean;
    resultUrl?: string | null;
    resultType?: 'image' | 'video';
}

export default function ResultViewer({
                                 isLoading,
                                 resultUrl,
                                 resultType = 'video'
                             }: ResultViewerProps) {
    const { t } = useTranslation('components');

    // 状态 1: 正在生成 (Loading)
    if (isLoading) {
        return (
            <div className="h-full min-h-100 w-full rounded-xl border border-border bg-muted/10 flex flex-col items-center justify-center gap-4">
                {/* 使用 Primary 颜色的 Loading 动画 */}
                <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {t("AI is dreaming...")}
                </p>
            </div>
        );
    }

    // 状态 2: 已生成结果
    if (resultUrl) {
        return (
            <div className="h-full min-h-100 w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm group relative">
                {resultType === 'video' ? (
                    <video
                        src={resultUrl}
                        controls
                        className="w-full h-full object-contain bg-black"
                        poster="/placeholder-video.jpg"
                    />
                ) : (
                    <img
                        src={resultUrl}
                        alt="Generated Result"
                        className="w-full h-full object-contain bg-black"
                    />
                )}

                {/* 下载按钮覆盖层 */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground shadow-md hover:bg-primary/90 font-medium text-sm">
                        <Download className="w-4 h-4" />
                        {t("Download")}
                    </button>
                </div>
            </div>
        );
    }

    // 状态 3: 空状态 (使用指南)
    return (
        <div className="h-full min-h-100 w-full rounded-xl border border-border bg-muted/20 p-8 flex flex-col items-center justify-center text-center">
            <div className="max-w-md space-y-8">
                <div className="space-y-2">
                    <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                        {t("Ready to Create?")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {t("Follow these simple steps to generate your AI video.")}
                    </p>
                </div>

                {/* 3步指南 - 使用 Card 样式 */}
                <div className="grid gap-4 text-left">
                    <StepItem
                        step={1}
                        title={t("Upload or Describe")}
                        desc={t("Upload a reference image or type a prompt.")}
                    />
                    <StepItem
                        step={2}
                        title={t("Configure Settings")}
                        desc={t("Choose aspect ratio and style.")}
                    />
                    <StepItem
                        step={3}
                        title={t("Generate")}
                        desc={t("Click the button and watch the magic.")}
                    />
                </div>
            </div>
        </div>
    );
}

// 辅助组件：指南单项
function StepItem({ step, title, desc }: { step: number; title: string; desc: string }) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-lg bg-card border border-border shadow-sm">
            <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                {step}
            </div>
            <div>
                <h4 className="text-sm font-medium text-foreground">{title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{desc}</p>
            </div>
        </div>
    );
}