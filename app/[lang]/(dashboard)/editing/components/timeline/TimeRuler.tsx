import React, {memo, useMemo, useState} from "react";
import { formatTime } from "@/lib/utils";
import { TICK_GAP, HEADER_WIDTH } from "./main";
import { useEditorStore } from "@/hooks/use-editor-store";

export const TimeRuler = memo(({ visualDuration, getTimeFromEvent }: any) => {
    const [hoverInfo, setHoverInfo] = useState<{ time: number } | null>(null);
    const setCurrentTime = useEditorStore(state => state.setCurrentTime)

    const ticks = useMemo(() => {
        const count = visualDuration / 60;
        return Array.from({ length: count + 1 }, (_, i) => i * 60);
    }, [visualDuration]);

    return (
        <div
            className="h-8 sticky top-0 z-30 flex items-end bg-background border-b border-border/50 cursor-crosshair mb-5"
            onPointerMove={(e) => setHoverInfo({ time: getTimeFromEvent(e.clientX) })}
            onPointerLeave={() => setHoverInfo(null)}
            onClick={(e) => setCurrentTime(getTimeFromEvent(e.clientX)) }
        >
            <div style={{ width: HEADER_WIDTH }} className="shrink-0 h-full bg-background" />
            <div className="relative flex-1 h-full">
                {ticks.map(t => (
                    <div key={t} className="absolute bottom-0 border-l border-border"
                         style={{ left: (t / 60) * TICK_GAP, height: t % 300 === 0 ? '14px' : '8px' }}>
                        {t % 60 === 0 && <span className="absolute left-1 bottom-1 opacity-40 font-mono">{t / 60}m</span>}
                    </div>
                ))}

                {/* 悬浮提示 */}
                {hoverInfo && (
                    <div className="absolute top-0 z-50 pointer-events-none flex flex-col items-center"
                         style={{ left: (hoverInfo.time / 60) * TICK_GAP }}>
                        <div className="
                                        bg-popover text-popover-foreground border shadow-md
                                        px-2 py-0.5 rounded-sm whitespace-nowrap font-mono
                                        bottom-full mb-1 -translate-x-1/2
                                        animate-in fade-in zoom-in-95 duration-100
                                    ">
                            {formatTime(hoverInfo.time)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
});