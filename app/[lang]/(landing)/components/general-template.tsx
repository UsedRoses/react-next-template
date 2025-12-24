"use client"

import React from 'react'
import { HeroSection } from './hero-section'
import { LogoCarousel } from './logo-carousel'
import {StatItem, StatsSection} from './stats-section'
import { FeaturesSection } from './features-section'
import { TeamSection } from './team-section'
import { TestimonialsSection } from './testimonials-section'
import { BlogSection } from './blog-section'
import { PricingSection } from './pricing-section'
import { CTASection } from './cta-section'
import { ContactSection } from './contact-section'
import { FaqSection } from './faq-section'
import { AboutSection } from './about-section'

interface GeneralTemplateProps {
    heroData: React.ComponentProps<typeof HeroSection>;
    logoData: React.ComponentProps<typeof LogoCarousel>;
    statsData: StatItem[];
}

export function GeneralPageContent({
                                       heroData,
                                       logoData,
                                       statsData,
                                   }: GeneralTemplateProps) {
    return (
        <div className="min-h-screen bg-background">
            {/* Main Content */}
            <main>
                <HeroSection {...heroData} />
                <LogoCarousel {...logoData}/>
                <StatsSection items={statsData}/>
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
        </div>
    )
}
