"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings2, Eye } from "lucide-react";

interface Props {
    currentView: string;
    onViewChange: (val: "config" | "result") => void;
    hasResult: boolean;
}

export function WorkspaceMobileNav({ currentView, onViewChange, hasResult }: Props) {
    return (
        <div className="xl:hidden shrink-0 px-3 py-2 border-b bg-background z-30">
            <Tabs value={currentView} onValueChange={(v) => onViewChange(v as any)} className="w-full">
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
    );
}