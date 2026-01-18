"use client";

import { useEffect } from "react";
import { ToolEngine } from "@/components/tools/ToolEngine";
import { ResultViewer } from "@/components/tools/ResultViewer";
import { useToolStore } from "@/hooks/use-tool-store";

export function ToolWorkspace({ toolConfig }: { toolConfig: any }) {
    const reset = useToolStore((s) => s.reset);

    // 重要：组件挂载时（或工具配置变化时），重置 Store
    // 防止用户在上一个页面生成的结果显示在当前页面
    useEffect(() => {
        reset();
        return () => reset(); // 卸载时也重置，保持干净
    }, [reset, toolConfig.id]);

    return (
        <>
            {/* 左侧：表单区 */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-fit">
                <ToolEngine config={toolConfig} />
            </div>

            {/* 右侧：结果区 */}
            <div className="h-full">
                <ResultViewer />
            </div>
        </>
    );
}