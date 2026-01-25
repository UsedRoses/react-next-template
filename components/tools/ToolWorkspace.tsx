"use client";

import { useEffect, useState } from "react";
import { ToolEngine } from "@/components/tools/ToolEngine";
import { ResultViewer } from "@/components/tools/ResultViewer";
import { Badge } from "@/components/ui/badge";
import { Settings2, Eye, Play, History, BookOpen, Sparkles, Image as ImageIcon } from "lucide-react";
import { useToolStore } from "@/hooks/use-tool-store";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlidingTabs } from "@/components/ui/sliding-tabs";

// 静态数据：如何使用 (恢复你的数据)
const HOW_TO_STEPS = [
    {
        title: "Upload Asset",
        desc: "Start by uploading your base image or video.",
        icon: <ImageIcon className="w-6 h-6 text-foreground" />,
        colorClass: "bg-chart-1/10 text-chart-1 border-chart-1/20",
    },
    {
        title: "Configure Params",
        desc: "Adjust the settings in the left sidebar.",
        icon: <Settings2 className="w-6 h-6 text-foreground" />,
        colorClass: "bg-chart-2/10 text-chart-2 border-chart-2/20",
    },
    {
        title: "Generate Result",
        desc: "Click generate and watch the magic happen.",
        icon: <Play className="w-6 h-6 text-foreground" />,
        colorClass: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    },
];

export function ToolWorkspace({ toolConfig }: { toolConfig: any }) {
    const reset = useToolStore((s) => s.reset);
    const result = useToolStore((s) => s.result);
    const hasResult = !!result;

    // 移动端 Tab 状态: 'config' | 'result'
    const [mobileTab, setMobileTab] = useState<string>("config");
    // 右侧内容 Tab 状态
    const [activeTab, setActiveTab] = useState("guide"); // 默认显示 guide

    useEffect(() => {
        reset();
        return () => reset();
    }, [reset, toolConfig.id]);

    // 移动端生成完毕自动跳转
    useEffect(() => {
        if (hasResult) {
            setMobileTab("result"); // 移动端切Tab
            setActiveTab("result"); // 右侧内容切Tab
        }
    }, [hasResult]);

    return (
        <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">

            {/* 1. 移动端顶部 Tab (xl:hidden) */}
            <div className="xl:hidden shrink-0 px-3 py-2 border-b bg-background z-30">
                <Tabs value={mobileTab} onValueChange={setMobileTab} className="w-full">
                    <TabsList className="w-full grid grid-cols-2 h-10">
                        <TabsTrigger value="config" className="flex items-center gap-2 cursor-pointer">
                            <Settings2 className="w-4 h-4" />
                            <span>Configure</span>
                        </TabsTrigger>
                        <TabsTrigger value="result" className="flex items-center gap-2 cursor-pointer">
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                            {hasResult && <span className="w-2 h-2 rounded-full bg-primary ml-2 animate-pulse" />}
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* 2. 主体内容区 (Flex Row) */}
            <div className="flex-1 flex flex-col xl:flex-row min-h-0 overflow-hidden relative">

                {/*
                   LEFT SIDEBAR: 表单区
                   - mobileTab === 'config' 时显示
                */}
                <aside className={cn(
                    "w-full xl:w-105 h-full shrink-0 z-20 overflow-hidden transition-all",
                    // 移动端控制显示/隐藏
                    mobileTab === "config" ? "flex p-3" : "hidden xl:flex xl:p-3"
                )}>
                    {/* 卡片容器：bg-muted/40 + rounded-md */}
                    <div className="bg-muted/40 w-full h-full flex flex-col overflow-hidden border border-border/50 rounded-md shadow-sm">

                        {/* 顶部模型选择 */}
                        <div className="p-4 border-b border-border/10 space-y-4 shrink-0">
                            <div className="group relative cursor-pointer overflow-hidden rounded-lg border border-border/50 bg-background/50 transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:scale-[1.005]">
                                <div className="aspect-video w-full bg-muted relative flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-linear-to-br from-background to-muted/50" />
                                    <Play className="w-8 h-8 text-muted-foreground/30 relative z-10" />
                                    <div className="absolute top-3 left-3 z-10">
                                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-md shadow-sm border-0">
                                            Stable Motion v2
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-3 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-semibold">General Model</h3>
                                        <p className="text-xs text-muted-foreground">Standard video generation</p>
                                    </div>
                                    <Settings2 className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                        </div>

                        {/* ToolEngine 容器：flex-1 + min-h-0 确保内部滚动 */}
                        <div className="flex-1 min-h-0 relative">
                            <ToolEngine config={toolConfig} />
                        </div>
                    </div>
                </aside>

                {/*
                   RIGHT MAIN: 内容区 (History / Guide / Result)
                   - 移动端：当 tab='result' 时显示
                   - 样式保留你的 bg-muted/20 + rounded-md
                */}
                <main className={cn(
                    "flex-1 flex-col min-w-0 h-full overflow-hidden transition-all",
                    // Padding 设置：移动端 p-3，桌面端 py-3 pr-3 (左边不需要padding因为Sidebar已经有了)
                    mobileTab === "result" ? "flex p-3" : "hidden xl:flex xl:py-3 xl:pr-3 xl:pl-0"
                )}>

                    {/* 这里是你的 SlidingTabs Header */}
                    <header className="flex items-center justify-between shrink-0 mb-3 z-10">
                        <SlidingTabs
                            activeTab={hasResult ? "result" : activeTab}
                            onChange={setActiveTab}
                            tabs={[
                                { id: "history", label: "History", icon: <History className="w-4 h-4" /> },
                                { id: "guide", label: "Guide", icon: <BookOpen className="w-4 h-4" /> },
                                ...(hasResult ? [{ id: "result", label: "Result", icon: <Sparkles className="w-4 h-4" /> }] : [])
                            ]}
                            className="w-full sm:w-auto"
                        />
                    </header>

                    {/*
                       内容滚动容器
                       bg-muted/20 + rounded-md 是你要的风格
                    */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-muted/20 rounded-md border border-border/50">
                        <div className="max-w-5xl mx-auto h-full">

                            {/* A. 结果视图 */}
                            {hasResult && activeTab === 'result' && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
                                    <ResultViewer />
                                </div>
                            )}

                            {/* B. 默认/空状态视图 */}
                            {(!hasResult || activeTab !== 'result') && (
                                <>
                                    {/* Tab: Guide (恢复你的代码) */}
                                    {activeTab === "guide" && (
                                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-12 py-4">
                                            <div className="space-y-4 text-center md:text-left">
                                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                                                    Create Cinematic Videos
                                                </h1>
                                                <p className="text-lg text-muted-foreground max-w-2xl">
                                                    Transform your ideas into reality using our advanced motion models.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {HOW_TO_STEPS.map((step, i) => (
                                                    <div key={i} className="group relative flex flex-col justify-between p-5 rounded-lg border border-border bg-card shadow-sm transition-all hover:border-primary/20 hover:-translate-y-1">
                                                        <div>
                                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4 border", step.colorClass)}>
                                                                {step.icon}
                                                            </div>
                                                            <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                                                            <p className="text-muted-foreground text-xs leading-relaxed">{step.desc}</p>
                                                        </div>
                                                        <span className="absolute bottom-2 right-4 text-5xl font-bold text-muted/40 pointer-events-none select-none">0{i + 1}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Tab: History (恢复你的代码) */}
                                    {activeTab === "history" && (
                                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-300 min-h-[300px]">
                                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                                <History className="w-8 h-8 opacity-20" />
                                            </div>
                                            <h3 className="text-lg font-medium text-foreground">No history yet</h3>
                                            <p className="text-sm mt-1">Generate your first video to see it here.</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}