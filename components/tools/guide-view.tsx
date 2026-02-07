"use client";

import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import * as Icons from "lucide-react"; // 动态加载图标

// 定义 Prop 结构，与数据库 JSON 结构对应
interface GuideViewProps {
    steps: Array<{
        title: string;
        desc: string;
        icon: string; // "Play", "Settings2" 字符串
        colorClass?: string;
    }>;
    title?: string;
    subtitle?: string;
}

export function GuideView({ steps, title, subtitle }: GuideViewProps) {
    return (
        <div className="space-y-8 py-4">
            <div className="space-y-4 text-center md:text-left">
                {/* 1. 优先使用数据库传来的 title，如果没有则用 fallback */}
                <h2 className="text-3xl font-bold tracking-tight">
                    {title}
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    {subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {steps?.map((step, i) => {
                    // 动态渲染图标
                    const IconComponent = (Icons as any)[step.icon] || Icons.HelpCircle;

                    return (
                        <div key={i} className="group relative p-5 rounded-lg border bg-card...">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4 border", step.colorClass)}>
                                <IconComponent className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-semibold mb-2">
                                {step.title} {/* 数据库里的动态文本 */}
                            </h3>
                            <p className="text-muted-foreground text-xs">
                                {step.desc} {/* 数据库里的动态文本 */}
                            </p>
                            <span className="absolute bottom-2 right-4 text-5xl font-bold text-muted/40 opacity-20">
                                0{i + 1}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}