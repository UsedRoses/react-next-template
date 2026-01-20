import React from 'react';
import { HeroFullScreenLayout } from '@/components/layouts/hero-full-screen-layout';
import { FeaturesSection } from '@/components/landing/seo/features-section';
import { FaqSection } from '@/components/landing/seo/faq-section';
import { TestimonialsSection } from '@/components/landing/seo/testimonials-section';
import { CTASection } from '@/components/landing/seo/cta-section';
import { SectionSeparator } from '@/components/ui/section-separator';
import {LogoCarousel} from "@/components/landing/seo/logo-carousel";
import {StatsSection} from "@/components/landing/seo/stats-section";
import {AboutSection} from "@/components/landing/seo/about-section";
import {SeoHeroSection} from "@/components/landing/seo/seo-hero-section";

interface SeoTemplateProps {
    toolSlot: React.ReactNode;
    seoContent: any;
}

type SectionComponent = React.ComponentType<{ data: any }>;

export function SeoLandingTemplate({ toolSlot, seoContent }: SeoTemplateProps) {
    const { hero, stats, about, features, faq, testimonials, cta } = seoContent || {};

    // 定义所有可能存在的板块
    const sections = [
        { id: "logo", Component: LogoCarousel as SectionComponent, data: { title: "" }, hasSeparator: true },
        { id: "stats", Component: StatsSection as SectionComponent, data: stats, hasSeparator: true },
        { id: "about", Component: AboutSection as SectionComponent, data: about, hasSeparator: true },
        { id: 'features', Component: FeaturesSection as SectionComponent, data: features, hasSeparator: true },
        { id: 'testimonials', Component: TestimonialsSection as SectionComponent, data: testimonials, hasSeparator: true },
        { id: 'cta', Component: CTASection as SectionComponent, data: cta, hasSeparator: true },
        { id: 'faq', Component: FaqSection as SectionComponent, data: faq, hasSeparator: true },
    ].filter(section => {
        if (Array.isArray(section.data)) return section.data.length > 0;
        if (typeof section.data === 'object') return Object.keys(section.data || {}).length > 0;
        return !!section.data;
    }); // 过滤掉没有数据的板块

    return (
        <div className="min-h-screen bg-background text-foreground">

            {/* 1. 顶部 Hero + 工具区 (背景可能略微不同，或者是透明) */}
            <HeroFullScreenLayout>
                {toolSlot}
            </HeroFullScreenLayout>

            <SeoHeroSection data={hero} />

            {/* 2. 动态渲染内容区 */}
            <div className="flex flex-col">
                {sections.map((section, index) => {
                    const { Component, data, id, hasSeparator } = section;

                    return (
                        <React.Fragment key={id}>
                            {/*
                                优雅的分割线逻辑：
                                1. 如果配置了 hasSeparator 为 true
                            */}
                            {hasSeparator && (
                                <SectionSeparator />
                            )}

                            {/* 板块渲染 */}
                            <div className="w-full">
                                <Component data={data} />
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* 底部留白 */}
            <div className="h-24"></div>
        </div>
    );
}