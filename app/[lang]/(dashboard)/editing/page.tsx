"use client";

import React from "react";
import {
    Plus,
    Download, Type, Music, Settings2,
    Share2, ChevronDown,
    Undo2, Redo2,
    Video
} from "lucide-react";
import { Button } from "@/components/ui/premium-button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MediaLibrary } from "@/app/[lang]/(dashboard)/editing/components/media-library";
import { Timeline } from "@/app/[lang]/(dashboard)/editing/components/timeline/main";

export default function VideoEditorPage() {

    return (
            <div className="@container/main flex flex-1 flex-col px-4 md:px-6">
                {/* 保持你原有的所有样式类名 */}
            <div className="rounded-md border h-[calc(100vh)] flex flex-col w-full bg-background text-foreground overflow-hidden font-sans py-4 text-xs text-balance">

                {/* 1. 顶部导航栏 - 保持原样 */}
                <header className="flex items-center justify-between px-4 shrink-0 md:pb-6 pb-4 ">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                <Video className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <span className="font-bold tracking-tight">VideoEditor</span>
                        </div>
                        <Separator
                            orientation="vertical"
                            className="data-[orientation=vertical]:h-4"
                        />
                        <div className="flex items-center gap-1 border-border">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Undo2 className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><Redo2 className="w-4 h-4" /></Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button variant="secondary" size="sm" className="gap-2 h-8">
                            <Share2 className="w-3.5 h-3.5" /> 共享 <ChevronDown className="w-3 h-3 opacity-50" />
                        </Button>
                        <Button size="sm" className="gap-2 h-8 bg-primary text-primary-foreground">
                            <Download className="w-3.5 h-3.5" /> 导出视频
                        </Button>
                    </div>
                </header>

                {/* --- 核心修复：中间区域容器 --- */}
                <div className="flex flex-1 min-h-0 overflow-hidden">

                    {/* 2. 左侧：资源媒体库 */}
                    <div className="w-72 flex flex-col shrink-0 h-full min-h-0 overflow-hidden">
                        <MediaLibrary />
                    </div>

                    {/* 3. 中间核心：工作区 */}
                    <main className="flex-1 flex flex-col overflow-hidden border rounded-md md:px-5 md:py-5 2xl:px-18 2xl:py-18 bg-background">
                        {/* 修复：添加 flex-1 和 min-h-0 确保父容器可以被压缩，不撑破外层 */}
                        <div className="flex-1 flex flex-col relative rounded-2xl min-h-0">

                            {/* 3.1 预览区 - 核心修复点 */}
                            <div className="flex-1 min-h-0 flex items-center justify-center">
                                <div className="w-full h-full  flex items-center justify-center">
                                    <div className="relative aspect-video max-w-full max-h-full w-full bg-black rounded-3xl shadow-2xl border border-border overflow-hidden flex items-center justify-center">
                                        <div className="text-muted-foreground/30 text-sm italic">
                                            Video Player Area
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </main>

                    {/* 4. 最右侧工具栏 - 增加 min-h-0 和 ScrollArea 包裹防止溢出 */}
                    <aside className="w-16 flex flex-col items-center gap-6 shrink-0 h-full min-h-0">
                        <ScrollArea className="w-full">
                            <div className="flex flex-col items-center gap-6 py-2">
                                <Button variant="secondary" size="icon" className="h-10 w-10 rounded-2xl shadow-sm"><Plus className="w-5 h-5" /></Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground"><Type className="w-5 h-5" /></Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground"><Music className="w-5 h-5" /></Button>
                                <Separator orientation="horizontal" className="data-[orientation=horizontal]:w-8" />
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground"><Settings2 className="w-5 h-5" /></Button>
                            </div>
                        </ScrollArea>
                    </aside>
                </div>

                {/* --- 5. 底部时间轴区 --- */}
                <div className="flex shrink-0 overflow-hidden mt-5 border-t">
                    <Timeline />
                </div>

            </div>
        </div>
    );
}