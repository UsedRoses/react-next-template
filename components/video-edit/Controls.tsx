"use client";

import { useEditor } from "./EditorContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Play, Pause } from "lucide-react";

export default function Controls() {
    const { state, dispatch } = useEditor();
    const { isPlaying, currentTime, duration, selectedId, subtitles } = state;

    const selectedSub = subtitles.find((s) => s.id === selectedId);

    const togglePlay = () => dispatch({ type: "SET_PLAYING", payload: !isPlaying });

    return (
        <div className="h-48 bg-slate-900 text-white border-t border-slate-800 p-6 flex gap-8">
            {/* 左侧：播放与进度 */}
            <div className="w-1/3 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    <Button onClick={togglePlay} variant={isPlaying ? "destructive" : "secondary"}>
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </Button>
                    <div className="font-mono text-sm">
                        {currentTime.toFixed(1)} / {duration.toFixed(1)}s
                    </div>
                </div>

                <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={0.1}
                    onPointerDown={() => dispatch({ type: "SET_DRAGGING_SEEK", payload: true })}
                    onValueChange={(val) => dispatch({ type: "SET_TIME", payload: val[0] })}
                    onPointerUp={() => dispatch({ type: "SET_DRAGGING_SEEK", payload: false })}
                    onValueCommit={() => dispatch({ type: "SET_DRAGGING_SEEK", payload: false })}
                />
            </div>

            {/* 右侧：字幕属性 */}
            <div className="w-2/3 border-l border-slate-700 pl-8">
                <h3 className="font-bold mb-4 text-slate-300">Subtitle Settings</h3>
                {selectedSub ? (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Text</label>
                            <Input
                                value={selectedSub.text}
                                onChange={(e) =>
                                    dispatch({ type: "UPDATE_SUB", payload: { id: selectedSub.id, patch: { text: e.target.value } } })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Size (px)</label>
                            <Input
                                type="number"
                                value={selectedSub.style.fontSize}
                                onChange={(e) =>
                                    dispatch({
                                        type: "UPDATE_SUB",
                                        payload: { id: selectedSub.id, patch: { fontSize: Number(e.target.value) } },
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Color</label>
                            <input
                                type="color"
                                value={selectedSub.style.fill}
                                onChange={(e) =>
                                    dispatch({
                                        type: "UPDATE_SUB",
                                        payload: { id: selectedSub.id, patch: { fill: e.target.value } },
                                    })
                                }
                                className="w-full h-9 rounded bg-transparent border border-slate-600"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-slate-500">Info</label>
                            <div className="text-xs text-slate-400 mt-2">
                                X: {Math.round(selectedSub.style.x)}, Y: {Math.round(selectedSub.style.y)}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-slate-500 text-sm flex items-center h-full">
                        Select a subtitle in the video to edit.
                    </div>
                )}
            </div>
        </div>
    );
}