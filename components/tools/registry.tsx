"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";
import { BaseFieldProps } from "@/types/tool-config";
import { Loader2 } from "lucide-react";

// 定义加载时的占位符 (Skeleton)
const LoadingPlaceholder = () => (
    <div className="w-full h-24 rounded-lg bg-muted/20 animate-pulse flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
    </div>
);

// 辅助函数：简化 dynamic 写法
const loadField = (importFn: any) =>
    dynamic(importFn, {
        loading: LoadingPlaceholder,
        ssr: false // 积木组件通常依赖浏览器API，关闭 SSR 可以避免 Hydration Mismatch
    }) as ComponentType<BaseFieldProps>;

export const FIELD_REGISTRY: Record<string, ComponentType<BaseFieldProps>> = {
    // 1. 文本输入
    textarea: loadField(() => import("./fields/MagicTextarea")),

    // 2. 可视化选择
    visual_selector: loadField(() => import("./fields/VisualSelector")),

    // 3. 图片/视频上传
    upload: loadField(() => import("./fields/VisualUploader")),

    // 4. 分割线
    divider: loadField(() => import("./fields/Divider")),

    // 以后如果要加 Slider, Switch 等组件，就在这里注册
    // Slider: loadField(() => import("./fields/Slider")),
};