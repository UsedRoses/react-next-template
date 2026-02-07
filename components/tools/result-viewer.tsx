"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Download } from "lucide-react";
import { useToolStore } from "@/hooks/use-tool-store";
import { useTranslation } from "react-i18next";
import {VideoComparisonPlayer} from "@/components/common/video-comparison-player";

export function ResultView() {
    const demoVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    const videoA = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

    // 视频 B: 钢铁之泪 (暗黑科幻风)
    // 这是一个完全不同的视频，拖动滑块你会看到画面彻底改变
    const videoB = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4";

    const { t } = useTranslation('tools');
    const { result, reuseResultAsInput } = useToolStore();

    if (!result) return null;

    const handleEditAgain = () => {
        // 假设 result 包含 prompt 等信息
        // 我们把这些信息提取出来，回传给表单
        const dataToFill = {
            prompt: result.prompt,
            aspect_ratio: result.aspectRatio,
            // ... 其他字段映射
        };
        reuseResultAsInput(dataToFill); // 触发 Zustand Action
    };

    return (
        <div className="space-y-4">
            {/* 结果展示区 */}
            <div className="rounded-lg overflow-hidden border">
                <VideoComparisonPlayer
                    src={demoVideoUrl}
                    compareSrc={videoB} // 这里传入相同的 URL，组件内的 style={{ filter }} 会负责制造差异
                    poster="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg"
                    className={'object-cover'}
                />
            </div>

            {/* 操作区 */}
            <div className="flex gap-2">
                <Button onClick={handleEditAgain} variant="secondary" className="flex-1">
                    <Edit2 className="w-4 h-4 mr-2" />
                    {t('Edit')} {/* 静态翻译: "二次编辑" */}
                </Button>
                <Button className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    {t('Download')}
                </Button>
            </div>
        </div>
    );
}