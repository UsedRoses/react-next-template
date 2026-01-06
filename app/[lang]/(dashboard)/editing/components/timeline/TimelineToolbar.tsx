import React, { memo } from "react";
import { Play, Pause, SkipBack, Scissors, Trash2, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/premium-button";
import { Separator } from "@/components/ui/separator";
import { formatTime } from "@/lib/utils";
import { useEditorStore } from "@/hooks/use-editor-store";

export const TimelineToolbar = memo(({ logicalDuration, isMounted }: any) => {
    const currentTime = useEditorStore(state => state.currentTime)
    const isPlaying = useEditorStore(state => state.isPlaying)
    const selectedId = useEditorStore(state => state.selectedId)
    const setPlaying = useEditorStore(state => state.setPlaying)
    const removeClip = useEditorStore(state => state.removeClip)

    return (
        <div className="py-2 flex items-center justify-between px-4 border-b shrink-0 bg-card/30">
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setPlaying(!isPlaying)}>
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                </Button>
                <Button variant="ghost" size="icon"><SkipBack size={18} /></Button>

                <div className="px-3 py-1 font-mono flex gap-1">
                    <span className="text-primary font-bold">{formatTime(currentTime)}</span>
                    <span className="opacity-30">/</span>
                    <span className="opacity-50">{isMounted ? formatTime(logicalDuration) : "00:00"}</span>
                </div>
                <Separator
                    orientation="vertical"
                    className="data-[orientation=vertical]:h-4"
                />
                <div className="flex items-center ml-2 gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Scissors size={14}/></Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        disabled={!selectedId}
                        onClick={() => removeClip(selectedId!)}
                        className="h-8 w-8 text-destructive"
                    >
                        <Trash2 size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
});