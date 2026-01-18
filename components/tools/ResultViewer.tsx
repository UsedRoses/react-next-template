"use client";

import { useTranslation } from "react-i18next";
import { Sparkles, Download } from "lucide-react";
import { useToolStore } from "@/hooks/use-tool-store"; // 引入 store

export function ResultViewer() {
    const { t } = useTranslation("components");

    // 主动从 Store 获取状态
    // 这里使用了 selector 写法，性能更好，只有这俩变化时才重渲染
    const isGenerating = useToolStore((s) => s.isGenerating);
    const result = useToolStore((s) => s.result);

    // Loading 状态
    if (isGenerating) {
        return (
            <div className="h-full min-h-100 w-full rounded-xl border border-border bg-muted/10 flex flex-col items-center justify-center gap-4">
                {/* Loading UI 保持不变 */}
                <div className="relative w-16 h-16">
                    {/* ...spinner... */}
                </div>
                <p className="text-sm font-medium text-muted-foreground animate-pulse">
                    {t("Loading.dreaming")}
                </p>
            </div>
        );
    }

    // 结果展示状态
    if (result && result.url) {
        return (
            <div className="h-full min-h-100 w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm group relative flex items-center justify-center">
                {result.type === 'video' ? (
                    <video src={result.url} controls className="max-w-full max-h-full" />
                ) : (
                    <img src={result.url} alt="Result" className="max-w-full max-h-full object-contain" />
                )}
                {/* 下载按钮... */}
            </div>
        );
    }

    // 空状态 (保持不变)
    return (
        <div className="h-full min-h-100 w-full rounded-xl border border-border bg-muted/20 p-8 flex flex-col items-center justify-center text-center">
            {/* ...Guides... */}
        </div>
    );
}