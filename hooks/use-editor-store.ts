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

    // 记录当前预测的落点（用于渲染描边框）
    dropPlaceholder: {
        trackId: string;
        startTime: number;
        duration: number;
    } | null;
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
        dropPlaceholder: null,

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
            const { draggingClip, clips } = get();
            if (!draggingClip) return;

            const TICK_GAP = 120;
            const PIXELS_PER_SECOND = TICK_GAP / 60;

            // 1. 计算物理偏移
            const deltaX = mouseX - draggingClip.startMouseX;
            const deltaTime = deltaX / PIXELS_PER_SECOND;

            // --- 核心修复 1：保留未受限的原始时间用于计算排序 ---
            // 允许负数，这样中心点才能小于第一个视频的中心点
            const rawStartTime = draggingClip.originalStartTime + deltaTime;

            // 这是给 UI 显示用的受限时间 (不能小于 0)
            const clampedStartTime = Math.max(0, rawStartTime);

            const activeClip = clips.find(c => c.id === draggingClip.id);
            if (!activeClip) return;
            const finalTrackId = trackId || activeClip.trackId;

            // 2. 获取同轨道其他 Clips
            const otherClips = clips
                .filter(c => c.trackId === finalTrackId && c.id !== draggingClip.id)
                .sort((a, b) => a.startTime - b.startTime);

            // 3. 计算插入点 (基于未受限的中心点)
            const activeMid = rawStartTime + (activeClip.duration / 2);

            let insertIndex = otherClips.length;

            for (let i = 0; i < otherClips.length; i++) {
                const target = otherClips[i];
                const targetMid = target.startTime + (target.duration / 2);

                // 只要我的物理中心点超过了你的中心点，我就插你前面
                if (activeMid < targetMid) {
                    insertIndex = i;
                    break;
                }
            }

            // 4. 生成新顺序队列
            const newOrderClips = [...otherClips];
            newOrderClips.splice(insertIndex, 0, activeClip);

            // 5. 紧凑堆叠算法 (Compact Stacking / Flow Layout)
            // 像 iPhone 图标一样，从 0 开始挨个往后排
            let cursorTime = 0;
            const shifts = new Map<string, number>();
            let dropTargetTime = 0; // 记录松手后应该吸附的位置

            newOrderClips.forEach(clip => {
                if (clip.id === draggingClip.id) {
                    // 正在拖拽的这个：记录它理论上该在的位置
                    dropTargetTime = cursorTime;
                } else {
                    // 其他 Clip：如果不现在的开始时间不等于堆叠位置，记录位移
                    if (clip.startTime !== cursorTime) {
                        shifts.set(clip.id, cursorTime);
                    }
                }
                // 游标累加，不留空隙
                cursorTime += clip.duration;
            });

            // 6. 应用更新
            set({
                // 借用 snapLineTime 暂存一下松手后的目标时间(可选技巧)
                // 或者专门加一个 dropTargetTime 状态，这里我们利用闭包在 stopDragClip 里处理不太方便
                // 所以我们最好把这个 dropTargetTime 存到 dropPlaceholder 里
                dropPlaceholder: {
                    trackId: finalTrackId,
                    startTime: dropTargetTime, // 这里的 StartTime 是松手后会对齐的时间
                    duration: activeClip.duration
                },

                clips: clips.map(c => {
                    // A. 拖拽物：位置跟随鼠标 (clamped)，但轨道跟随计算结果
                    if (c.id === draggingClip.id) {
                        return { ...c, startTime: clampedStartTime, trackId: finalTrackId };
                    }
                    // B. 被挤开的物：应用堆叠计算出的新位置
                    if (shifts.has(c.id)) {
                        return { ...c, startTime: shifts.get(c.id)! };
                    }
                    return c;
                })
            });
        },

        stopDragClip: () => {
            const { draggingClip, dropPlaceholder, clips } = get();
            if (!draggingClip) return;

            set({
                draggingClip: null,
                dropPlaceholder: null, // 清理占位数据
                clips: clips.map(c =>
                    c.id === draggingClip.id
                        ? {
                            ...c,
                            // 如果有计算好的落点，就去落点；否则回原位或保持当前
                            startTime: dropPlaceholder ? dropPlaceholder.startTime : c.startTime,
                            trackId: dropPlaceholder ? dropPlaceholder.trackId : c.trackId
                        }
                        : c
                )
            });
        },

        // --- 字幕 ---
        addSubtitle: (sub) => set((state) => ({ subtitles: [...state.subtitles, sub] })),
        updateSubtitle: (id, patch) => set((state) => ({
            subtitles: state.subtitles.map(s => s.id === id ? { ...s, ...patch } : s)
        })),
    }))
);