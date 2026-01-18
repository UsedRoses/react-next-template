import { create } from 'zustand';

interface ToolState {
    isGenerating: boolean;
    progress: number; // 预留：未来可以做进度条
    result: {
        url: string | null;
        type: 'image' | 'video';
    } | null;

    // Actions
    startGeneration: () => void;
    finishGeneration: (url: string, type?: 'image' | 'video') => void;
    stopGeneration: () => void; // 用于出错或取消
    reset: () => void; // 切换页面时重置
}

export const useToolStore = create<ToolState>((set) => ({
    isGenerating: false,
    progress: 0,
    result: null,

    startGeneration: () => set({ isGenerating: true, progress: 0, result: null }),

    finishGeneration: (url, type = 'video') => set({
        isGenerating: false,
        progress: 100,
        result: { url, type }
    }),

    stopGeneration: () => set({ isGenerating: false, progress: 0 }),

    reset: () => set({ isGenerating: false, progress: 0, result: null })
}));