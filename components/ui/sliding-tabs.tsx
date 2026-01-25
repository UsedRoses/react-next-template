"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
}

interface SlidingTabsProps {
    tabs: TabItem[];
    activeTab: string;
    onChange: (id: string) => void;
    className?: string;
}

export function SlidingTabs({ tabs, activeTab, onChange, className }: SlidingTabsProps) {
    return (
        <div className={cn("flex space-x-1 rounded-md bg-muted/40 p-1 ", className)}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={cn(
                            "relative flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex-1 sm:flex-none cursor-pointer",
                            isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                    >
                        {/* 只有激活时渲染这个背景层，framer-motion 会处理移动动画 */}
                        {isActive && (
                            <motion.div
                                layoutId="active-tab-bubble"
                                className="absolute inset-0 z-0 rounded-md bg-background shadow-sm ring-1 ring-border/50"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}

                        {/* 内容层，z-index 需高于背景 */}
                        <span className="relative z-10 flex items-center gap-2">
                          {tab.icon}{tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}