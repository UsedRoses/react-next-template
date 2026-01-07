import {Application, Sprite, Texture, VideoSource} from "pixi.js";
import { useEditorStore } from "@/hooks/use-editor-store";

interface ResourceMap {
    [assetId: string]: HTMLVideoElement;
}

export class PlayerEngine {
    private app: Application | null = null; // 允许为空，方便销毁判断
    private container: HTMLElement;
    private resources: ResourceMap = {};
    private clipSprites: Map<string, Sprite> = new Map();
    private isDestroyed = false; // 销毁标记
    private lastMediaListRef: any[] | null = null; // 用于存储上一次的数组引用

    constructor(container: HTMLElement) {
        this.container = container;
        // 注意：不要在 constructor 里 new Application，因为 init 是异步的
        // 我们延后到 init 里创建
    }

    public async init(width: number, height: number) {
        if (this.isDestroyed) return;

        this.app = new Application();

        await this.app.init({
            width,
            height,
            backgroundColor: 0x000000,
            preference: "webgl",
            backgroundAlpha: 1,
            // 自动 resize 可能会导致冲突，建议手动管理
            autoDensity: true,
            resolution: window.devicePixelRatio || 1,
        });

        // 再次检查：因为 await 期间可能已经触发了 destroy
        if (this.isDestroyed || !this.app.canvas) {
            if (this.app) {
                this.app.destroy();
            }
            return;
        }

        // 挂载 Canvas
        this.container.appendChild(this.app.canvas);

        // 绑定样式确保填满容器
        this.app.canvas.style.width = "100%";
        this.app.canvas.style.height = "100%";
        this.app.canvas.style.display = "block";

        // 设置 Pixi Ticker (绑定上下文)
        this.app.ticker.add(this.gameLoop, this);
    }

    private gameLoop() {
        // 安全检查：如果 app 没了，停止循环
        if (!this.app || this.isDestroyed) return;

        const state = useEditorStore.getState();
        const { isPlaying, currentTime, clips, tracks, mediaList } = state;

        if (isPlaying) {
            // 使用 ticker.deltaMS 确保时间精准
            const deltaSeconds = this.app.ticker.deltaMS / 1000;
            const newTime = currentTime + deltaSeconds;

            useEditorStore.setState({ currentTime: newTime });

            if (newTime >= state.duration) {
                useEditorStore.setState({ isPlaying: false });
            }
        }

        // --- 2. 垃圾回收 (Garbage Collection) ---
        // 核心优化：只有当 mediaList 的引用发生变化时，才执行昂贵的清理逻辑
        // 正常播放时，这一行判断耗时几乎为 0
        if (mediaList !== this.lastMediaListRef) {
            this.performGarbageCollection(mediaList);
            this.lastMediaListRef = mediaList; // 更新引用
        }

        this.syncClipsToTime(currentTime, clips, mediaList, tracks);
    }

    /**
     * 独立的 GC 方法：清理 DOM 和显存
     * 这个方法只会在用户点击“删除素材”或“上传新素材”的那一瞬间执行一次
     */
    private performGarbageCollection(currentList: any[]) {
        const state = useEditorStore.getState();

        // --- A. 清理 Video DOM 资源 (基于 Asset) ---
        const currentAssetIds = new Set(currentList.map(m => m.id));

        Object.keys(this.resources).forEach(assetId => {
            // 如果资源库里已经没这个素材了
            if (!currentAssetIds.has(assetId)) {
                // 1. 销毁 Video DOM
                const videoEl = this.resources[assetId];
                if (videoEl instanceof HTMLVideoElement) {
                    videoEl.pause();
                    videoEl.removeAttribute('src'); // 兼容性更好的写法
                    videoEl.load();
                    videoEl.remove();
                }
                delete this.resources[assetId];
                console.log(`[GC] Video Element Destroyed: ${assetId}`);
            }
        });

        // --- B. 清理 Pixi Sprite 资源 (基于 Clip) ---
        // 逻辑修正：遍历当前内存里的 Sprite，检查它是否还存在于全局 State 中
        // 如果 State 里没了，说明被删了，必须销毁 Sprite
        const currentClipIds = new Set(state.clips.map(c => c.id));

        this.clipSprites.forEach((sprite, clipId) => {
            if (!currentClipIds.has(clipId)) {
                // 1. 销毁底层的 VideoSource (如果有)
                if (sprite.texture && sprite.texture.source) {
                    sprite.texture.source.destroy();
                }

                // 2. 销毁 Sprite
                sprite.destroy({
                    children: true,
                    texture: true
                });

                this.clipSprites.delete(clipId);
                console.log(`[GC] Pixi Sprite Destroyed: ${clipId}`);
            }
        });
    }

    private async syncClipsToTime(
        currentTime: number,
        clips: any[],
        mediaList: any[],
        tracks: any[]
    ) {
        if (!this.app || this.isDestroyed) return;

        // 1. 记录当前这一帧，哪些 assetId 是“正在被使用”的
        const activeAssetIds = new Set<string>();
        const activeClipIds = new Set<string>();

        const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);

        for (const track of sortedTracks) {
            const activeClip = clips.find(c =>
                c.trackId === track.id &&
                currentTime >= c.startTime &&
                currentTime < c.startTime + c.duration
            );

            if (activeClip) {
                const asset = mediaList.find(a => a.id === activeClip.assetId);
                if (!asset) continue;

                // 标记为活跃
                activeClipIds.add(activeClip.id);
                activeAssetIds.add(asset.id);

                const mediaTime = currentTime - activeClip.startTime;

                if (asset.type === 'video') {
                    await this.renderVideoClip(activeClip.id, asset, mediaTime);
                }
            }
        }

        // 2. 【核心修复】：处理 Sprite 的可见性
        this.clipSprites.forEach((sprite, clipId) => {
            // 如果这个 Clip 不在当前播放列表里（被删了，或者时间没到），隐藏它
            if (!activeClipIds.has(clipId)) {
                sprite.visible = false;
            }
        });

        // 3. 【核心修复】：处理声音 (幽灵声音修复)
        // 遍历所有已缓存的 video 元素
        Object.keys(this.resources).forEach(assetId => {
            const videoEl = this.resources[assetId];

            // 如果这个资源 ID 不在 activeAssetIds 集合里
            // 说明它当前不需要播放（可能是 Clip 被删了，或者滑到了空白区域）
            if (!activeAssetIds.has(assetId)) {
                if (!videoEl.paused) {
                    videoEl.pause(); // 立即静音/暂停
                }
            }
        });
    }

    private async renderVideoClip(clipId: string, asset: any, mediaTime: number) {
        if (!this.app || this.isDestroyed) return;

        let videoEl = this.resources[asset.id];

        // 1. 初始化 Video 元素
        if (!videoEl) {
            videoEl = document.createElement('video');
            videoEl.src = URL.createObjectURL(asset.file);
            videoEl.preload = 'auto';
            videoEl.muted = false;
            videoEl.volume = 1;
            // 关键：部分浏览器需要此属性才能在 WebGL 中使用视频
            videoEl.setAttribute('playsinline', '');
            videoEl.crossOrigin = "anonymous";
            this.resources[asset.id] = videoEl;
        }

        // 2. 检查就绪状态
        if (videoEl.readyState < 2) return;
        if (videoEl.videoWidth === 0 || videoEl.videoHeight === 0) return;

        const { isPlaying, isDraggingSeek, draggingClip } = useEditorStore.getState();
        const isScrubbing = isDraggingSeek || !!draggingClip || !isPlaying;

        if (isScrubbing) {
            // --- 刷片模式 ---
            if (!videoEl.paused) videoEl.pause();

            if (Math.abs(videoEl.currentTime - mediaTime) > 0.05) {
                // 【核心修复】：使用 (videoEl as any) 绕过类型推断，防止 else 分支变成 never
                // 或者显式判断方法是否存在
                const v = videoEl as any;

                if (typeof v.fastSeek === 'function') {
                    v.fastSeek(mediaTime);
                } else {
                    videoEl.currentTime = mediaTime;
                }
            }
        } else {
            // --- 播放模式 ---
            if (Math.abs(videoEl.currentTime - mediaTime) > 0.2) {
                videoEl.currentTime = mediaTime;
            }

            if (videoEl.paused) {
                videoEl.play().catch(e => {});
            }
        }

        // 4. Pixi 渲染
        let sprite = this.clipSprites.get(clipId) as Sprite;

        if (!sprite) {
            // 使用 VideoSource 手动管理
            const source = new VideoSource({
                resource: videoEl,
                autoPlay: false,
                width: videoEl.videoWidth,  // 显式指定宽
                height: videoEl.videoHeight // 显式指定高
            });

            // 异步加载
            await source.load();

            // 再次检查销毁
            if (!this.app || this.isDestroyed) {
                source.destroy();
                return;
            }

            const texture = new Texture({ source });
            sprite = new Sprite(texture);
            this.fitSpriteToScreen(sprite);
            this.app.stage.addChild(sprite);
            this.clipSprites.set(clipId, sprite);
        }

        sprite.visible = true;

        // 5. 强制纹理更新 (核心)
        const source = sprite.texture.source;
        if (source && videoEl.readyState >= 2) {
            if (source.width !== videoEl.videoWidth || source.height !== videoEl.videoHeight) {
                source.resize(videoEl.videoWidth, videoEl.videoHeight);
            }
            source.update();
        }
    }

    private fitSpriteToScreen(sprite: Sprite) {
        if (!this.app) return;
        const screenW = this.app.screen.width;
        const screenH = this.app.screen.height;
        // 简单的 contain 逻辑
        const scale = Math.min(screenW / sprite.texture.width, screenH / sprite.texture.height);

        sprite.scale.set(scale);
        sprite.anchor.set(0.5);
        sprite.x = screenW / 2;
        sprite.y = screenH / 2;
    }

    public resize(width: number, height: number) {
        // 如果 app 还没初始化完(renderer不存在)，直接忽略这次 resize 请求
        if (!this.app || !this.app.renderer || this.isDestroyed) return;

        this.app.renderer.resize(width, height);

        // 重新计算所有画面适配
        this.clipSprites.forEach(sprite => this.fitSpriteToScreen(sprite));
    }

    /**
     * 安全销毁方法
     */
    public destroy() {
        this.isDestroyed = true;

        if (this.app) {
            // 1. 先停止 Ticker，防止渲染循环报错
            if (this.app.ticker) {
                try {
                    this.app.ticker.stop();
                    this.app.ticker.remove(this.gameLoop, this);
                } catch (e) {
                    console.warn("Ticker cleanup failed:", e);
                }
            }

            try {
                // 2. 手动移除 Canvas DOM (更安全，防止 React 和 Pixi 抢 DOM)
                if (this.app.canvas && this.app.canvas.parentNode) {
                    this.app.canvas.parentNode.removeChild(this.app.canvas);
                }

                // 3. 【核心修复】显式销毁 Stage (释放纹理和子元素内存)
                // v8 中，纹理清理选项需要在 Container/Stage 级别调用
                if (this.app.stage && !this.app.stage.destroyed) {
                    this.app.stage.destroy({
                        children: true,
                        texture: true
                    });
                }

                // 4. 【核心修复】销毁 Application
                // v8 的 app.destroy 参数类型是 ViewSystemDestroyOptions
                // 这里只需要告诉它不用再管 View 了 (因为我们第2步移除了)
                this.app.destroy({
                    removeView: false
                });

            } catch (e) {
                console.warn("Pixi destroy warning:", e);
            }
            this.app = null;
        }

        // 5. 清理视频 DOM 资源
        Object.values(this.resources).forEach(el => {
            el.pause();
            el.removeAttribute('src');
            el.load();
            el.remove();
        });
        this.resources = {};
        this.clipSprites.clear();
    }
}