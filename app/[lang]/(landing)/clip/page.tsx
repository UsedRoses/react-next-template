"use client";

import { useState } from "react";
import VideoEditor from "@/components/video-edit/VideoEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, X, Film } from "lucide-react";
import {LogoCarousel} from "@/app/[lang]/(landing)/components/logo-carousel";
import {AboutSection} from "@/app/[lang]/(landing)/components/about-section";
import {FeaturesSection} from "@/app/[lang]/(landing)/components/features-section";
import {TeamSection} from "@/app/[lang]/(landing)/components/team-section";
import {PricingSection} from "@/app/[lang]/(landing)/components/pricing-section";
import {TestimonialsSection} from "@/app/[lang]/(landing)/components/testimonials-section";
import {BlogSection} from "@/app/[lang]/(landing)/components/blog-section";
import {FaqSection} from "@/app/[lang]/(landing)/components/faq-section";
import {CTASection} from "@/app/[lang]/(landing)/components/cta-section";
import {ContactSection} from "@/app/[lang]/(landing)/components/contact-section";
import React from "react";

const initialSubtitles = [
    {
        id: "sub_1",
        text: "Welcome to React Pixi Editor",
        startTime: 0,
        endTime: 5,
        style: { x: 100, y: 200, fontSize: 60, fill: "#ffffff" },
    },
    {
        id: "sub_2",
        text: "Drag Me around!",
        startTime: 2,
        endTime: 8,
        style: { x: 300, y: 400, fontSize: 80, fill: "#ff0000" },
    },
];

export default function Page() {
    const [selectedVideo, setSelectedVideo] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith("video/")) {
            setSelectedVideo(file);
        } else {
            alert("请选择有效的视频文件");
        }
    };

    const clearVideo = () => setSelectedVideo(null);

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <div className="max-w-6xl mx-auto p-6 lg:p-10">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">AI 视频字幕编辑器</h1>
                        <p className="text-slate-500 mt-1">本地处理，保护隐私，极速体验</p>
                    </div>

                    {selectedVideo && (
                        <Button variant="outline" onClick={clearVideo} className="gap-2">
                            <X className="w-4 h-4" /> 更换视频
                        </Button>
                    )}
                </div>

                {!selectedVideo ? (
                    // --- 上传区域 ---
                    <Card className="border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-20 flex flex-col items-center justify-center text-center transition-all hover:border-blue-400">
                        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-6">
                            <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-xl font-semibold mb-2">选择视频开始编辑</h2>
                        <p className="text-slate-500 mb-6 max-w-sm">
                            支持 MP4, WebM, MOV 等主流格式，文件大小不限（本地实时解析）
                        </p>
                        <div className="relative">
                            <Input
                                type="file"
                                accept="video/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                            <Button size="lg" className="px-8">
                                选取视频文件
                            </Button>
                        </div>
                    </Card>
                ) : (
                    // --- 编辑器区域 ---
                    <div className="space-y-6">
                        <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800">
                            <VideoEditor
                                src={selectedVideo} // 直接传入 File 对象
                                subtitles={initialSubtitles} // 初始字幕
                                autoPlay={false}
                            />
                        </div>
                        {/* 这里可以放下方的时间轴和字幕列表控制组件 */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-4 md:col-span-2">
                                <p className="text-sm font-medium text-slate-500 mb-2 px-1 flex items-center gap-2">
                                    <Film className="w-4 h-4" />
                                    视频信息: {selectedVideo.name} ({(selectedVideo.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                                <div className="h-32 bg-slate-100 dark:bg-slate-800 rounded flex items-center justify-center text-slate-400">
                                    时间轴占位符 (Timeline)
                                </div>
                            </Card>
                            <Card className="p-4">
                                <h3 className="font-bold mb-4">字幕属性</h3>
                                <div className="text-sm text-slate-500">点击画布上的字幕进行编辑</div>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
            <LogoCarousel />
            <AboutSection />
            <FeaturesSection />
            <TeamSection />
            <PricingSection />
            <TestimonialsSection />
            <BlogSection />
            <FaqSection />
            <CTASection />
            <ContactSection />

        </main>
    );
}