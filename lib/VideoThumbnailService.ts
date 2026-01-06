export class VideoThumbnailService {
    private static instance: VideoThumbnailService | null = null;
    private readonly video: HTMLVideoElement;
    private queue: Promise<void> = Promise.resolve();

    // 1. 全局结果缓存：Key = Fingerprint + Width
    private cache: Map<string, string> = new Map();
    // 2. 正在进行的任务池：防止并发点击产生的重复计算
    private pending: Map<string, Promise<string>> = new Map();

    private constructor() {
        if (typeof window === "undefined") throw new Error("Client only");
        const v = document.createElement("video");
        v.muted = true;
        v.playsInline = true;
        v.preload = "auto";
        v.style.display = 'none';
        document.body.appendChild(v);
        this.video = v;
    }

    public static getInstance(): VideoThumbnailService {
        if (!this.instance) this.instance = new VideoThumbnailService();
        return this.instance;
    }

    /**
     * 生产级生成逻辑：带缓存与并发合并
     */
    public async generateFilmstrip(file: File, width: number, height: number = 64): Promise<string> {
        // 生成唯一标识（快速指纹）
        const fingerprint = `${file.name}-${file.size}-${file.lastModified}`;
        const taskKey = `${fingerprint}-${width}`;

        // 第一步：检查缓存，有则直接返回
        const cached = this.cache.get(taskKey);
        if (cached) return cached;

        // 第二步：检查是否已有相同任务在处理
        const ongoing = this.pending.get(taskKey);
        if (ongoing) return ongoing;

        // 第三步：推入 Promise 队列并标记为 pending
        const task = new Promise<string>((resolve, reject) => {
            this.queue = this.queue.then(async () => {
                try {
                    const result = await this.process(file, width, height);
                    this.cache.set(taskKey, result); // 存入缓存
                    resolve(result);
                } catch (err) {
                    reject(err);
                } finally {
                    this.pending.delete(taskKey); // 处理完不论成败，移除 pending
                }
            });
        });

        this.pending.set(taskKey, task);
        return task;
    }

    private async process(file: File, width: number, height: number): Promise<string> {
        const video = this.video;
        const objectUrl = URL.createObjectURL(file);

        return new Promise((resolve, reject) => {
            const cleanup = () => {
                video.onloadedmetadata = null;
                video.onerror = null;
                video.src = "";
                URL.revokeObjectURL(objectUrl);
            };

            video.src = objectUrl;
            video.onloadedmetadata = async () => {
                try {
                    const { duration, videoWidth, videoHeight } = video;
                    const aspectRatio = videoWidth / videoHeight;
                    const singleFrameWidth = height * aspectRatio;
                    const frameCount = Math.ceil(width / singleFrameWidth);
                    const step = duration / frameCount;

                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d", { alpha: false });
                    if (!ctx) throw new Error("Canvas Context Fail");

                    for (let i = 0; i < frameCount; i++) {
                        video.currentTime = i * step;
                        await this.waitForFrame();
                        ctx.drawImage(video, i * singleFrameWidth, 0, singleFrameWidth, height);
                    }

                    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
                    cleanup();
                    resolve(dataUrl);
                } catch (err) {
                    cleanup();
                    reject(err);
                }
            };
            video.onerror = () => { cleanup(); reject(new Error("Video Load Fail")); };
        });
    }

    private async waitForFrame(): Promise<void> {
        return new Promise((resolve) => {
            const video = this.video as any;
            if (typeof video.requestVideoFrameCallback === "function") {
                video.requestVideoFrameCallback(() => resolve());
            } else {
                const onSeeked = () => {
                    video.removeEventListener("seeked", onSeeked);
                    resolve();
                };
                video.addEventListener("seeked", onSeeked);
            }
            setTimeout(resolve, 500); // 兜底，防止坏帧导致队列永久阻塞
        });
    }
}