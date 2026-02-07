"use client";

import { useEffect } from "react";
import { useToolStore } from "@/hooks/use-tool-store";
import { WorkspaceMobileNav } from "./workspace-mobile-nav";
import { ConfigSidebar } from "./config-sidebar";
import { ContentPanel } from "./content-panel";

interface ToolWorkspaceProps {
    toolConfig: any;      // 表单配置
    dynamicContent: any;  // 页面文案 (seo_content_json)
}

export function ToolWorkspace({ toolConfig, dynamicContent }: ToolWorkspaceProps) {
    const {
        activeMobileView,
        setMobileView,
        reset
    } = useToolStore();

    // 提取结果状态用于 UI 判断
    const hasResult = useToolStore(s => !!s.result);

    useEffect(() => {
        reset();
    }, [reset, toolConfig.id]);

    return (
        <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">

            {/* 1. 导航 (状态全部走 Store) */}
            <WorkspaceMobileNav
                currentView={activeMobileView}
                onViewChange={setMobileView}
                hasResult={hasResult}
            />

            <div className="flex-1 flex flex-col xl:flex-row min-h-0 overflow-hidden relative">

                {/* 2. 左侧配置 */}
                <ConfigSidebar
                    isVisible={activeMobileView === "config"}
                    toolConfig={toolConfig}
                />

                {/* 3. 右侧内容面板 */}
                {/* 关键：将 dynamicContent 传给 ContentPanel */}
                <ContentPanel
                    isVisible={activeMobileView === "result"}
                    hasResult={hasResult}
                    // 从 dynamicContent 中提取 guide 数据
                    guideData={{
                        steps: dynamicContent?.how_to_steps, // 假设数据库有这个字段
                        title: dynamicContent?.how_to_title,
                        subtitle: dynamicContent?.how_to_subtitle
                    }}
                />
            </div>
        </div>
    );
}