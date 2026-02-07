"use client";

import { ToolEngine } from "@/components/tools/tool-engine";
import { cn } from "@/lib/utils";

interface ConfigSidebarProps {
    isVisible: boolean; // 用于移动端控制
    toolConfig: any;
}

export function ConfigSidebar({ isVisible, toolConfig }: ConfigSidebarProps) {
    return (
        <aside className={cn(
            "w-full xl:w-100 h-full shrink-0 z-20 overflow-hidden transition-all",
            isVisible ? "flex p-3" : "hidden xl:flex xl:p-3"
        )}>
            <div className="bg-muted/40 w-full h-full flex flex-col overflow-hidden border border-border/50 rounded-md shadow-sm">
                <ToolEngine config={toolConfig} />
            </div>
        </aside>
    );
}