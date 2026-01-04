export const generateVideoThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        video.style.display = "none";
        video.preload = "metadata";
        video.src = URL.createObjectURL(file);
        video.muted = true;
        video.playsInline = true;

        video.onloadeddata = () => {
            // 跳到第 1 秒提取封面，防止开头是黑屏
            video.currentTime = 1;
        };

        video.onseeked = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL("image/jpeg");
            URL.revokeObjectURL(video.src);
            resolve(dataUrl);
        };
    });
};


export const getVideoMetadata = (file: File): Promise<{ duration: number }> => {
    return new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = URL.createObjectURL(file);
        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src);
            resolve({ duration: video.duration });
        };
    });
};