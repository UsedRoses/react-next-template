import { History } from "lucide-react";

export function HistoryView() {
    // 实际项目中这里应该从 store 或 API 获取历史列表
    const historyList = [];

    if (historyList.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground animate-in fade-in duration-300 min-h-75">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <History className="w-8 h-8 opacity-20" />
                </div>
                <h3 className="text-lg font-medium text-foreground">No history yet</h3>
                <p className="text-sm mt-1">Generate your first video to see it here.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* 渲染历史卡片列表 */}
            History List Component Here...
        </div>
    );
}