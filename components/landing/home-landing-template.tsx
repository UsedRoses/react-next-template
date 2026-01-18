import React from 'react'
import { HeroSection } from './seo/hero-section'
import { LogoCarousel } from './seo/logo-carousel'
import { StatItem, StatsSection } from './seo/stats-section'
import { FeaturesSection } from './seo/features-section'
import { TeamSection } from './seo/team-section'
import { TestimonialsSection } from './seo/testimonials-section'
import { BlogSection } from './seo/blog-section'
import { PricingSection } from './seo/pricing-section'
import { CTASection } from './seo/cta-section'
import { ContactSection } from './seo/contact-section'
import { FaqSection } from './seo/faq-section'
import { AboutSection } from './seo/about-section'
import {SectionSeparator} from "@/components/ui/section-separator";

interface HomeTemplateProps {
    heroData?: React.ComponentProps<typeof HeroSection>;
    statsData?: StatItem[];
    aboutData?: React.ComponentProps<typeof AboutSection>['data'];
    futureData?: React.ComponentProps<typeof FeaturesSection>['data'];
    testimonialsData?: React.ComponentProps<typeof TestimonialsSection>['data'];
    ctaData?: React.ComponentProps<typeof CTASection>['data'];
    faqData?: React.ComponentProps<typeof FaqSection>['data'];
}

export function HomeLandingTemplate({
                                       heroData,
                                       statsData,
                                       aboutData,
                                       futureData,
                                       testimonialsData,
                                       ctaData,
                                       faqData
                                   }: HomeTemplateProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Main Content */}
            <main>
                {heroData && <HeroSection {...heroData} />}
                <LogoCarousel />
                {statsData && statsData.length > 0 && <StatsSection data={statsData}/>}
                <SectionSeparator />
                {aboutData && <AboutSection data={aboutData} />}
                <SectionSeparator />
                {futureData && <FeaturesSection data={futureData} />}
                <SectionSeparator />
                <TeamSection />
                <SectionSeparator />
                <PricingSection />
                <SectionSeparator />
                {testimonialsData && <TestimonialsSection data={testimonialsData} /> }
                <SectionSeparator />
                <BlogSection />
                <SectionSeparator />
                {ctaData && <CTASection data={ctaData} />}
                <SectionSeparator />
                {faqData && <FaqSection data={faqData} />}
            </main>
        </div>
    )
}
