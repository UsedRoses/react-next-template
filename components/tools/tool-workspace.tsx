"use client";

import { useEffect } from "react";
import { useToolStore } from "@/hooks/use-tool-store";
import { WorkspaceMobileNav } from "./workspace-mobile-nav";
import { ConfigSidebar } from "./config-sidebar";
import { ContentPanel } from "./content-panel";

// 定义清晰的接口
interface GuideStep {
    title: string;
    desc: string;
    icon: string;
    colorClass?: string;
}

interface ToolWorkspaceProps {
    toolConfig: any; // 经过服务端合并后的完整配置
    guideData: {     // 明确的结构，方便 ContentPanel 使用
        title?: string;
        subtitle?: string;
        steps?: GuideStep[];
    };
}

export function ToolWorkspace({ toolConfig, guideData }: ToolWorkspaceProps) {
    const {
        activeMobileView,
        setMobileView,
        reset
    } = useToolStore();

    // 提取结果状态
    const hasResult = useToolStore(s => !!s.result);

    // 初始化重置 Store，防止上一个页面的状态残留
    useEffect(() => {
        reset();
    }, [reset, toolConfig.id]); // 依赖 ID 变化重置

    return (
        <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">

            {/* 1. 移动端导航 */}
            <WorkspaceMobileNav
                currentView={activeMobileView}
                onViewChange={setMobileView}
                hasResult={hasResult}
            />

            <div className="flex-1 flex flex-col xl:flex-row min-h-0 overflow-hidden relative">

                {/* 2. 左侧配置 (Sidebar) */}
                <ConfigSidebar
                    isVisible={activeMobileView === "config"}
                    toolConfig={toolConfig}
                />

                {/* 3. 右侧内容面板 (Content) */}
                <ContentPanel
                    isVisible={activeMobileView === "result"}
                    hasResult={hasResult}
                    // 直接传入清洗后的 guideData
                    guideData={guideData}
                />
            </div>
        </div>
    );
}