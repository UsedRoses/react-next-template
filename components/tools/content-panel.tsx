"use client";

import { useTranslation} from 'react-i18next';
import { History, BookOpen, Sparkles } from "lucide-react";
import { SlidingTabs } from "@/components/ui/sliding-tabs";
import { cn } from "@/lib/utils";
import { useToolStore } from "@/hooks/use-tool-store";

// 引入视图组件
import { GuideView } from "./guide-view";
import { HistoryView } from "./history-view";
import { ResultView } from "./result-viewer";

interface ContentPanelProps {
    isVisible: boolean;
    hasResult: boolean;
    guideData: any; // 数据库传来的动态数据
}

export function ContentPanel({ isVisible, hasResult, guideData }: ContentPanelProps) {
    const { t } = useTranslation('tools');
    const { activeDesktopTab, setDesktopTab } = useToolStore();

    // React Compiler 会自动优化这个对象创建，不需要 useMemo
    const tabs = [
        {
            id: "history",
            label: t('History'),
            icon: <History className="w-4 h-4" />
        },
        {
            id: "guide",
            label: t('Guide'),
            icon: <BookOpen className="w-4 h-4" />
        },
    ];

    // 动态添加 Result Tab
    if (hasResult) {
        tabs.push({
            id: "result",
            label: t('Result'),
            icon: <Sparkles className="w-4 h-4" />
        });
    }

    // 处理回退逻辑：如果当前选的是 result 但 result 被清空了，自动显示 guide
    // 这里的逻辑也会被 Compiler 自动优化
    const currentTab = (!hasResult && activeDesktopTab === 'result')
        ? 'guide'
        : activeDesktopTab;

    return (
        <main className={cn(
            "flex-1 flex-col min-w-0 h-full overflow-hidden transition-all",
            isVisible ? "flex p-3" : "hidden xl:flex xl:py-3 xl:pr-3 xl:pl-0"
        )}>
            {/* Header: Tab 切换 */}
            <header className="flex items-center justify-between shrink-0 mb-3 z-10">
                <SlidingTabs
                    tabs={tabs}
                    activeTab={currentTab}
                    onChange={setDesktopTab}
                    className="w-full sm:w-auto"
                />
            </header>

            {/* Body: 内容滚动区 */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth bg-muted/20 rounded-md border border-border/50">
                <div className="max-w-5xl mx-auto h-full">

                    {currentTab === "guide" && (
                        <GuideView
                            steps={guideData?.steps}
                            title={guideData?.title}
                            subtitle={guideData?.subtitle}
                        />
                    )}

                    {currentTab === "history" && (
                        <HistoryView />
                    )}

                    {/* 只有在有结果时才渲染 ResultView */}
                    {currentTab === "result" && hasResult && (
                        <ResultView />
                    )}

                </div>
            </div>
        </main>
    );
}