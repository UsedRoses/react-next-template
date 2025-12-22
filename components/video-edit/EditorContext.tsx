"use client";

import React, { createContext, useContext, useReducer, ReactNode } from "react";

// --- 类型定义 ---
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

interface State {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    subtitles: Subtitle[];
    selectedId: string | null;
    isDraggingSeek: boolean; // 是否正在拖动进度条
}

// --- Action 定义 ---
type Action =
    | { type: "SET_PLAYING"; payload: boolean }
    | { type: "SET_TIME"; payload: number }
    | { type: "SET_DURATION"; payload: number }
    | { type: "SET_DRAGGING_SEEK"; payload: boolean }
    | { type: "SELECT_SUB"; payload: string | null }
    | { type: "UPDATE_SUB"; payload: { id: string; patch: Partial<Subtitle> | Partial<Subtitle["style"]> } }
    | { type: "INIT_SUBS"; payload: Subtitle[] };

// --- 初始状态 ---
const initialState: State = {
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    subtitles: [],
    selectedId: null,
    isDraggingSeek: false,
};

// --- Reducer ---
function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_PLAYING":
            return { ...state, isPlaying: action.payload };
        case "SET_TIME":
            return { ...state, currentTime: action.payload };
        case "SET_DURATION":
            return { ...state, duration: action.payload };
        case "SET_DRAGGING_SEEK":
            return { ...state, isDraggingSeek: action.payload };
        case "SELECT_SUB":
            return { ...state, selectedId: action.payload };
        case "INIT_SUBS":
            return { ...state, subtitles: action.payload };
        case "UPDATE_SUB":
            return {
                ...state,
                subtitles: state.subtitles.map((sub) => {
                    if (sub.id !== action.payload.id) return sub;
                    // 智能合并样式或属性
                    const { patch } = action.payload;
                    if ("x" in patch || "y" in patch || "fontSize" in patch || "fill" in patch) {
                        return { ...sub, style: { ...sub.style, ...patch } };
                    }
                    return { ...sub, ...patch };
                }),
            };
        default:
            return state;
    }
}

// --- Context ---
const EditorContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export const EditorProvider = ({ children, initialSubtitles }: { children: ReactNode; initialSubtitles: Subtitle[] }) => {
    const [state, dispatch] = useReducer(reducer, { ...initialState, subtitles: initialSubtitles });
    return <EditorContext.Provider value={{ state, dispatch }}>{children}</EditorContext.Provider>;
};

// --- Hook ---
export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) throw new Error("useEditor must be used within EditorProvider");
    return context;
};