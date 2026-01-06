import { memo } from "react";
import { TICK_GAP, HEADER_WIDTH } from "./main";
import { useEditorStore } from "@/hooks/use-editor-store";

export const Playhead = memo(() => {
    const currentTime = useEditorStore(state => state.currentTime);
    const isDraggingSeek = useEditorStore(state => state.isDraggingSeek);
    const setDraggingSeek = useEditorStore(state => state.setDraggingSeek);

    const left = HEADER_WIDTH + (currentTime / 60) * TICK_GAP - 7;

    return (
        <div
            className="absolute top-0 bottom-0 z-50 cursor-ew-resize group flex flex-col items-center"
            style={{
                left,
                transition: isDraggingSeek ? 'none' : 'left 0.1s linear',
                willChange: 'left'
            }}
            onMouseDown={(e) => {
                e.preventDefault();
                setDraggingSeek(true)
            }}
        >
            <div className="w-3.5 h-3.5 bg-primary rounded-full border-2 border-background shadow-md z-10" />
            <div className="w-0.5 h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
        </div>
    );
});