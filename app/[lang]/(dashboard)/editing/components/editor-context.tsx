"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

// --- 1. 类型定义 ---

export interface MediaAsset {
    id: string;
    file: File;
    type: "video" | "audio" | "image";
    duration: number;
}

export interface Track {
    id: string;
    type: "video" | "audio" | "text";
    order: number;
}

export interface TimelineClip {
    id: string;
    assetId: string; // 关联素材 ID
    trackId: string; // 属于哪个轨道
    startTime: number; // 时间轴上的起始秒数
    duration: number; // 持续时长
}

export interface Subtitle {
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    style: {
        x: number;
        y: number;
        fontSize: number;
        fill: string;
    };
}

interface EditorState {
    // 基础状态
    isPlaying: boolean;
    currentTime: number;
    duration: number; // 总时长（动态伸缩）
    isDraggingSeek: boolean; // 播放头是否正在被拖拽

    // 资源与轨道
    mediaList: MediaAsset[]; // 素材库
    tracks: Track[];         // 轨道列表
    clips: TimelineClip[];   // 时间轴上的片段

    // 字幕与选中
    subtitles: Subtitle[];
    selectedId: string | null; // 当前选中的组件 ID (字幕或 Clip)

    // 拖动素材
    draggingClip: {
        id: string;
        startMouseX: number; // 开始时的鼠标像素位置
        originalStartTime: number; // 开始时的逻辑时间
    } | null;

    snapLineTime: number | null; // 记录当前正在吸附的时间点，用于显示辅助线
}

type Action =
    | { type: "SET_PLAYING"; payload: boolean }
    | { type: "SET_TIME"; payload: number }
    | { type: "SET_DURATION"; payload: number }
    | { type: "SET_DRAGGING"; payload: boolean }
    // 素材管理
    | { type: "ADD_ASSET"; payload: MediaAsset }
    | { type: "REMOVE_ASSET"; payload: string } // assetId
    // 时间轴逻辑
    | { type: "ADD_CLIP_TO_TRACK"; payload: { assetId: string; trackId: string; } }
    | { type: "REMOVE_ASSETS_CLIPS"; payload: string } // 资源删除时清理轨道
    | { type: "UPDATE_TRACK_ORDER"; payload: Track[] }
    // 字幕操作
    | { type: "ADD_SUB"; payload: Subtitle }
    | { type: "UPDATE_SUB"; payload: { id: string; patch: Partial<Subtitle> } }
    | { type: "SELECT_ID"; payload: string | null }
    // 视频胶卷操作
    | { type: "SELECT_CLIP"; payload: string | null }
    | { type: "REMOVE_CLIP"; payload: string }
    | { type: "UPDATE_CLIP_TIME"; payload: { clipId: string; newStartTime: number; newTrackId?: string } }
    | { type: "START_DRAG_CLIP"; payload: { id: string; mouseX: number; startTime: number } }
    | { type: "MOVE_CLIP_REALTIME"; payload: { mouseX: number; trackId?: string } }
    | { type: "STOP_DRAG_CLIP" };

// --- 2. 初始状态 ---
const initialState: EditorState = {
    isPlaying: false,
    currentTime: 0,
    duration: 1800, // 默认 30 分钟 (1800秒)
    isDraggingSeek: false,
    mediaList: [],
    // 默认提供三条轨道
    tracks: [
        { id: "track-video-1", type: "video", order: 1 },
    ],
    clips: [],
    subtitles: [],
    selectedId: null,
    draggingClip: null,
    snapLineTime: null,
};

// --- 3. Reducer 核心逻辑 ---

function editorReducer(state: EditorState, action: Action): EditorState {
    switch (action.type) {
        case "SET_PLAYING":
            return { ...state, isPlaying: action.payload };
        case "SET_TIME":
            return { ...state, currentTime: action.payload };
        case "SET_DURATION":
            return { ...state, duration: action.payload };
        case "SET_DRAGGING":
            return { ...state, isDraggingSeek: action.payload };

        // 素材管理
        case "ADD_ASSET":
            return { ...state, mediaList: [...state.mediaList, action.payload] };
        case "REMOVE_ASSET":
            return { ...state, mediaList: state.mediaList.filter(a => a.id !== action.payload) };

        // 时间轴拖入
        case "ADD_CLIP_TO_TRACK": {
            const { assetId, trackId } = action.payload;
            const asset = state.mediaList.find(a => a.id === assetId);
            if (!asset) return state;

            // 1. 获取当前轨道上已有的所有 clips
            const trackClips = state.clips
                .filter(c => c.trackId === trackId)
                .sort((a, b) => a.startTime - b.startTime);

            // 2. 计算放置位置：你要求“顶头开始”
            // 逻辑：如果轨道为空，startTime = 0；如果轨道已有视频，则排在最后一个视频后面
            let startTime = 0;
            if (trackClips.length > 0) {
                const lastClip = trackClips[trackClips.length - 1];
                startTime = lastClip.startTime + lastClip.duration;
            }

            const newClip: TimelineClip = {
                id: crypto.randomUUID(),
                assetId,
                trackId,
                startTime,
                duration: asset.duration || 0, // 使用上传时获取的真实时长
            };

            return {
                ...state,
                clips: [...state.clips, newClip],
                // 更新总时长，留 5 分钟缓冲
                duration: Math.max(state.duration, startTime + newClip.duration + 300)
            };
        }

        case "REMOVE_ASSETS_CLIPS":
            return { ...state, clips: state.clips.filter(c => c.assetId !== action.payload) };

        case "UPDATE_TRACK_ORDER":
            return { ...state, tracks: action.payload };

        // 字幕逻辑
        case "ADD_SUB":
            return { ...state, subtitles: [...state.subtitles, action.payload] };
        case "UPDATE_SUB":
            return {
                ...state,
                subtitles: state.subtitles.map(s => s.id === action.payload.id ? { ...s, ...action.payload.patch } : s)
            };
        case "SELECT_ID":
            return { ...state, selectedId: action.payload };
        case "SELECT_CLIP":
            return { ...state, selectedId: action.payload };
        case "REMOVE_CLIP":
            return {
                ...state,
                clips: state.clips.filter(c => c.id !== action.payload),
                selectedId: state.selectedId === action.payload ? null : state.selectedId
            };
        case "UPDATE_CLIP_TIME": {
            const {clipId, newStartTime, newTrackId} = action.payload;
            return {
                ...state,
                clips: state.clips.map(c =>
                    c.id === clipId
                        ? {...c, startTime: newStartTime, trackId: newTrackId || c.trackId}
                        : c
                )
            };
        }
        case "START_DRAG_CLIP":
            return {
                ...state,
                selectedId: action.payload.id,
                // 手动将 payload 里的值映射到 state 要求的键名上
                draggingClip: {
                    id: action.payload.id,
                    startMouseX: action.payload.mouseX,       // mouseX -> startMouseX
                    originalStartTime: action.payload.startTime // startTime -> originalStartTime
                }
            };
        case "MOVE_CLIP_REALTIME": {
            if (!state.draggingClip) return state;

            const { mouseX, trackId } = action.payload;
            const { startMouseX, originalStartTime, id } = state.draggingClip;

            // 1. 基础转换常量
            const TICK_GAP = 120; // 1分钟=120px
            const PIXELS_PER_SECOND = TICK_GAP / 60; // 2px/s

            // 2. 计算未吸附前的原始起始时间
            const deltaX = mouseX - startMouseX;
            const deltaTime = deltaX / PIXELS_PER_SECOND;
            let newStartTime = Math.max(0, originalStartTime + deltaTime);

            // --- 磁吸逻辑开始 ---

            // 3. 定义磁吸阈值（像素转秒）
            // 假设鼠标距离边缘 10 像素以内就触发吸附
            const SNAP_THRESHOLD_PX = 10;
            const SNAP_THRESHOLD_SEC = SNAP_THRESHOLD_PX / PIXELS_PER_SECOND;

            const draggingClipObj = state.clips.find(c => c.id === id);
            if (!draggingClipObj) return state;

            const duration = draggingClipObj.duration;
            const newEndTime = newStartTime + duration;

            // 4. 收集所有可能的“磁吸点” (Snap Points)
            // 磁吸点包括：所有其他 Clip 的起点、终点，以及当前的播放头位置
            const snapPoints: number[] = [0, state.currentTime]; // 默认吸附 0s 和 播放头

            state.clips.forEach(c => {
                if (c.id === id) return;
                snapPoints.push(c.startTime);              // 其他片段的起点
                snapPoints.push(c.startTime + c.duration); // 其他片段的终点
            });

            // 5. 寻找最近的磁吸点
            let bestSnapTime = newStartTime;
            let minDiff = SNAP_THRESHOLD_SEC;

            let activeSnapLine: number | null = null; // 临时变量：记录触发吸附的线

            snapPoints.forEach(point => {
                // 情况 A: 我的起点靠近吸附点
                const diffStart = Math.abs(newStartTime - point);
                if (diffStart < minDiff) {
                    minDiff = diffStart;
                    bestSnapTime = point;
                    activeSnapLine = point;
                }

                // 情况 B: 我的终点靠近吸附点
                const diffEnd = Math.abs(newEndTime - point);
                if (diffEnd < minDiff) {
                    minDiff = diffEnd;
                    bestSnapTime = point - duration; // 吸附终点，所以起点要减去时长
                    activeSnapLine = point;
                }
            });

            newStartTime = bestSnapTime;

            // --- 磁吸逻辑结束 ---

            return {
                ...state,
                snapLineTime: activeSnapLine,
                clips: state.clips.map(c =>
                    c.id === id ? { ...c, startTime: newStartTime, trackId: trackId || c.trackId } : c
                )
            };
        }

        case "STOP_DRAG_CLIP":
            return { ...state, draggingClip: null, snapLineTime: null };

        default:
            return state;
    }
}

// --- 4. Context 创建 ---

const EditorContext = createContext<{
    state: EditorState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(editorReducer, initialState);

    return (
        <EditorContext.Provider value={{ state, dispatch }}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error("useEditor must be used within an EditorProvider");
    }
    return context;
};