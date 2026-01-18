import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeoHeroSectionProps {
    data?: {
        h1: string;
        sub: string;
        badge?: string;
        // 新增：首图配置
        image?: {
            src: string;
            alt: string;
            width?: number;
            height?: number;
        };
    };
}

export function SeoHeroSection({ data }: SeoHeroSectionProps) {
    if (!data) return null;

    return (
        <section className="relative w-full py-20 md:py-32 overflow-hidden">

            <div className="container px-4 sm:px-6 lg:px-8 mx-auto relative z-10">
                <div className="flex flex-col items-center text-center space-y-10">

                    {/* 1. 文本区域 (严格居中，限制最大宽度以保证阅读体验) */}
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Badge */}
                        {data.badge && (
                            <div className="flex justify-center">
                                <Badge
                                    variant="secondary"
                                    className="px-4 py-1.5 text-sm rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-2"
                                >
                                    <Sparkles className="w-3.5 h-3.5" />
                                    {data.badge}
                                </Badge>
                            </div>
                        )}

                        {/* H1 Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] text-balance">
                            {data.h1}
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
                            {data.sub}
                        </p>
                    </div>

                    {/* 2. 首图区域 (Visual Anchor) */}
                    {data.image && (
                        <div className="relative w-full max-w-5xl mx-auto mt-8 group">

                            {/* 背景光效：在图片后面加一个巨大的光晕 */}
                            <div className="absolute -inset-1 bg-linear-to-r from-primary/30 to-purple-500/30 rounded-2xl blur-2xl opacity-50 group-hover:opacity-75 transition duration-1000"></div>

                            {/* 图片容器：带边框和阴影 */}
                            <div className="relative rounded-2xl border border-border/50 bg-card shadow-2xl overflow-hidden ring-1 ring-white/10">
                                <Image
                                    src={data.image.src}
                                    alt={data.image.alt || data.h1}
                                    width={data.image.width || 1200}
                                    height={data.image.height || 630}
                                    className="w-full h-auto object-cover"
                                    priority // 因为是首图，优先加载
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                                />

                                {/* 图片上的光泽遮罩 (可选，增加质感) */}
                                <div className="absolute inset-0 bg-linear-to-t from-background/20 to-transparent pointer-events-none"></div>
                            </div>

                        </div>
                    )}

                </div>
            </div>
        </section>
    );
}