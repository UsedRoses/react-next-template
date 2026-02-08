import {useEffect, useState} from "react";

export function useFilePreview(file: File | string | null | undefined) {
    const [preview, setPreview] = useState<string>("");

    useEffect(() => {
        if (!file) {
            setPreview("");
            return;
        }

        // 如果已经是 URL 字符串（编辑模式回显），直接使用
        if (typeof file === "string") {
            setPreview(file);
            return;
        }

        // 如果是 File 对象，创建 Blob URL
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // 清理函数：组件卸载或 file 变化时释放内存
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    return preview;
}