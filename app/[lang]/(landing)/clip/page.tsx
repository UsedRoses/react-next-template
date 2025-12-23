// app/page.tsx
"use client";

import VideoEditor from "@/components/video-edit/VideoEditor";
import {LogoCarousel} from "@/app/[lang]/(landing)/components/logo-carousel";
import {StatsSection} from "@/app/[lang]/(landing)/components/stats-section";
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
    return (
        <main>
            <div className="h-screen w-full p-10">
                <h1 className="text-2xl mb-4 font-bold">My Video Editor</h1>

                {/* 限制容器大小，内部视频会自动适应 */}
                <VideoEditor
                    src="/demo.mp4"
                    subtitles={initialSubtitles}
                    autoPlay={false} // 控制是否自动播放
                />
            </div>
            <LogoCarousel />
            <StatsSection />
            <AboutSection />
            <FeaturesSection />
            <TeamSection />
            <PricingSection />
            <TestimonialsSection />
            <BlogSection />
            <FaqSection />
            <CTASection />
            <ContactSection />

            {/*/!* Theme Customizer *!/*/}
            {/*<LandingThemeCustomizerTrigger onClick={() => setThemeCustomizerOpen(true)} />*/}
            {/*<LandingThemeCustomizer open={themeCustomizerOpen} onOpenChange={setThemeCustomizerOpen} />*/}
        </main>
    );
}