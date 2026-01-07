import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// --- 1. 类型定义  ---

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
    assetId: string;
    trackId: string;
    startTime: number;
    duration: number;
}

export interface Subtitle {
    id: string;
    text: string;
    startTime: number;
    endTime: number;
    style: { x: number; y: number; fontSize: number; fill: string };
}

// --- 2. Store 状态接口 ---

interface EditorState {
    // 基础状态
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    isDraggingSeek: boolean;

    // 资源与轨道
    mediaList: MediaAsset[];
    tracks: Track[];
    clips: TimelineClip[];

    // 字幕与选中
    subtitles: Subtitle[];
    selectedId: string | null;

    // 交互状态
    draggingClip: {
        id: string;
        startMouseX: number;
        originalStartTime: number;
    } | null;
    snapLineTime: number | null;

    // --- Actions (方法) ---
    setPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
    setDuration: (duration: number) => void;
    setDraggingSeek: (dragging: boolean) => void;

    // 素材管理
    addAsset: (asset: MediaAsset) => void;
    removeAsset: (assetId: string) => void;

    // 时间轴 Clip 操作
    addClipToTrack: (assetId: string, trackId: string) => void;
    removeClip: (clipId: string) => void;
    selectElement: (id: string | null) => void;

    // 拖拽逻辑
    startDragClip: (id: string, mouseX: number, startTime: number) => void;
    moveClipRealtime: (mouseX: number, trackId?: string) => void;
    stopDragClip: () => void;

    // 字幕操作
    addSubtitle: (sub: Subtitle) => void;
    updateSubtitle: (id: string, patch: Partial<Subtitle>) => void;
}

// --- 3. 创建 Store ---

export const useEditorStore = create<EditorState>()(
    devtools((set, get) => ({
        // --- 初始状态 ---
        isPlaying: false,
        currentTime: 0,
        duration: 1800,
        isDraggingSeek: false,
        mediaList: [],
        tracks: [{ id: "track-video-1", type: "video", order: 1 }],
        clips: [],
        subtitles: [],
        selectedId: null,
        draggingClip: null,
        snapLineTime: null,

        // --- 基础控制 Actions ---
        setPlaying: (playing) => set({ isPlaying: playing }),
        setCurrentTime: (time) => set({ currentTime: time }),
        setDuration: (duration) => set({ duration }),
        setDraggingSeek: (dragging) => set((state) => ({
            isDraggingSeek: dragging,
            // 关键：一旦开始拖拽，立即暂停，防止渲染循环冲突
            isPlaying: dragging ? false : state.isPlaying
        })),
        selectElement: (id) => set({ selectedId: id }),

        // --- 素材管理 ---
        addAsset: (asset) => set((state) => ({
            mediaList: [...state.mediaList, asset]
        })),

        removeAsset: (assetId) => set((state) => ({
            mediaList: state.mediaList.filter(a => a.id !== assetId),
            clips: state.clips.filter(c => c.assetId !== assetId)
        })),

        // --- 添加 Clip 到轨道 (顶头逻辑) ---
        addClipToTrack: (assetId, trackId) => {
            const { mediaList, clips, duration } = get();
            const asset = mediaList.find(a => a.id === assetId);
            if (!asset) return;

            const trackClips = clips
                .filter(c => c.trackId === trackId)
                .sort((a, b) => a.startTime - b.startTime);

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
                duration: asset.duration || 0,
            };

            set({
                clips: [...clips, newClip],
                duration: Math.max(duration, startTime + newClip.duration + 300),
                isPlaying: false // 关键：添加新素材时暂停，给解码器缓冲时间
            });
        },

        removeClip: (clipId) => set((state) => ({
            clips: state.clips.filter(c => c.id !== clipId),
            selectedId: state.selectedId === clipId ? null : state.selectedId
        })),

        // --- 磁吸拖拽逻辑 ---
        startDragClip: (id, mouseX, startTime) => set({
            selectedId: id,
            draggingClip: { id, startMouseX: mouseX, originalStartTime: startTime },
            isPlaying: false  // 关键：拖素材时必须暂停
        }),

        moveClipRealtime: (mouseX, trackId) => {
            const { draggingClip, clips, currentTime } = get();
            if (!draggingClip) return;

            const TICK_GAP = 120;
            const PIXELS_PER_SECOND = TICK_GAP / 60;

            const deltaX = mouseX - draggingClip.startMouseX;
            const deltaTime = deltaX / PIXELS_PER_SECOND;
            let newStartTime = Math.max(0, draggingClip.originalStartTime + deltaTime);

            // 磁吸计算
            const SNAP_THRESHOLD_SEC = 10 / PIXELS_PER_SECOND;
            const draggingClipObj = clips.find(c => c.id === draggingClip.id);
            if (!draggingClipObj) return;

            const clipDuration = draggingClipObj.duration;
            const newEndTime = newStartTime + clipDuration;

            const snapPoints = [0, currentTime];
            clips.forEach(c => {
                if (c.id === draggingClip.id) return;
                snapPoints.push(c.startTime, c.startTime + c.duration);
            });

            let bestSnapTime = newStartTime;
            let minDiff = SNAP_THRESHOLD_SEC;
            let activeSnapLine: number | null = null;

            snapPoints.forEach(point => {
                const diffStart = Math.abs(newStartTime - point);
                if (diffStart < minDiff) {
                    minDiff = diffStart;
                    bestSnapTime = point;
                    activeSnapLine = point;
                }
                const diffEnd = Math.abs(newEndTime - point);
                if (diffEnd < minDiff) {
                    minDiff = diffEnd;
                    bestSnapTime = point - clipDuration;
                    activeSnapLine = point;
                }
            });

            set({
                snapLineTime: activeSnapLine,
                clips: clips.map(c =>
                    c.id === draggingClip.id ? { ...c, startTime: bestSnapTime, trackId: trackId || c.trackId } : c
                )
            });
        },

        stopDragClip: () => set({ draggingClip: null, snapLineTime: null }),

        // --- 字幕 ---
        addSubtitle: (sub) => set((state) => ({ subtitles: [...state.subtitles, sub] })),
        updateSubtitle: (id, patch) => set((state) => ({
            subtitles: state.subtitles.map(s => s.id === id ? { ...s, ...patch } : s)
        })),
    }))
);