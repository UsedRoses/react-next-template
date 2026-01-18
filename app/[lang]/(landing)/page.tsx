import type {Metadata} from 'next'
import {HomeLandingTemplate} from '@/components/landing/home-landing-template'
import {useTranslation} from '@/i18n/server';
import {AboutSection} from "@/components/landing/seo/about-section";

// Metadata for the landing page
export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
    const { lang } = await params;

    // 明确指定命名空间 'landing'，确保 parser 提取到 landing.json
    // 注意：这里建议采用我之前建议的 (ns, lang) 顺序，或者维持你目前的 (lang, ns)
    const { t } = await useTranslation('landing', lang);

    return {
        title: t('ShadcnStore - Modern Admin Dashboard Template'),
        description: t('A beautiful and comprehensive admin dashboard template built with React, Next.js, TypeScript, and shadcn/ui.'),
        keywords: [
            t('admin dashboard'),
            t('react'),
            t('nextjs'),
            t('typescript'),
            t('shadcn/ui'),
            t('tailwind css')
        ],
        openGraph: {
            title: t('ShadcnStore - Modern Admin Dashboard Template'),
            description: t('A beautiful and comprehensive admin dashboard template built with React, Next.js, TypeScript, and shadcn/ui.'),
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: t('ShadcnStore - Modern Admin Dashboard Template'),
            description: t('A beautiful and comprehensive admin dashboard template built with React, Next.js, TypeScript, and shadcn/ui.'),
        },
    }
}


export default async function LandingPage({params}: { params: Promise<{ lang: string }> }) {
    const {lang} = await params;
    const {t} = await useTranslation('landing', lang);

    // --- 构造 About 数据 ---
    const HOME_ABOUT_DATA = {
        header: {
            badge: t("About ShadcnStore"),
            title: t("Built for developers, by developers"),
            description: t("We're passionate about creating the best marketplace for shadcn/ui components and templates. Our mission is to accelerate development and help developers build beautiful admin interfaces faster.")
        },
        values: [
            {
                iconName: "Code",
                title: t("Developer First"),
                description: t("Every component is built with the developer experience in mind, ensuring clean code and easy integration.")
            },
            {
                iconName: "Palette",
                title: t("Design Excellence"),
                description: t("We maintain the highest design standards, following shadcn/ui principles and modern UI patterns.")
            },
            {
                iconName: "Layout",
                title: t("Production Ready"),
                description: t("Battle-tested components used in real applications with proven performance and reliability across different environments.")
            },
            {
                iconName: "Crown",
                title: t("Premium Quality"),
                description: t("Hand-crafted with attention to detail and performance optimization, ensuring exceptional user experience and accessibility.")
            }
        ],
        cta: {
            footerText: t("❤️ Made with love for the developer community"),
            buttons: [
                {
                    text: t("Star on GitHub"),
                    href: "https://github.com/silicondeck/shadcn-dashboard-landing-template",
                    iconName: "Github",
                    variant: "default" as const
                },
                {
                    text: t("Join Discord Community"),
                    href: "https://discord.com/invite/XEQhPc9a6p",
                    // 这里如果不想要图标可以不传，或者传 'MessageSquare'
                    variant: "outline" as const
                }
            ]
        }
    };

    const HOME_FEATURES_DATA = {
        header: {
            badge: t("Marketplace Features"),
            title: t("Everything you need to build amazing web applications"),
            description: t("Our marketplace provides curated blocks, templates, landing pages, and admin dashboards to help you build professional applications faster than ever.")
        },
        blocks: [
            // Block 1: 图片在左
            {
                title: t("Components that accelerate development"),
                description: t("Our curated marketplace offers premium blocks and templates designed to save time and ensure consistency across your admin projects."),
                image: {
                    lightSrc: "/feature-1-light.png",
                    darkSrc: "/feature-1-dark.png",
                    alt: t("Analytics dashboard"),
                    position: "left" as const
                },
                items: [
                    {
                        iconName: "Package",
                        title: t("Curated Component Library"),
                        description: t("Hand-picked blocks and templates for quality and reliability.")
                    },
                    {
                        iconName: "Crown",
                        title: t("Free & Premium Options"),
                        description: t("Start free, upgrade to premium collections when you need more.")
                    },
                    {
                        iconName: "Layout",
                        title: t("Ready-to-Use Templates"),
                        description: t("Copy-paste components that just work out of the box.")
                    },
                    {
                        iconName: "Zap",
                        title: t("Regular Updates"),
                        description: t("New blocks and templates added weekly to keep you current.")
                    }
                ],
                buttons: [
                    {
                        text: t("Browse Templates"),
                        href: "https://shadcnstore.com/templates",
                        variant: "default" as const
                    },
                    {
                        text: t("View Components"),
                        href: "https://shadcnstore.com/blocks",
                        variant: "outline" as const
                    }
                ]
            },
            // Block 2: 图片在右
            {
                title: t("Built for modern development workflows"),
                description: t("Every component follows best practices with TypeScript, responsive design, and clean code architecture that integrates seamlessly into your projects."),
                image: {
                    lightSrc: "/feature-2-light.png",
                    darkSrc: "/feature-2-dark.png",
                    alt: t("Performance dashboard"), // Alt 文本也需要翻译
                    position: "right" as const
                },
                items: [
                    {
                        iconName: "BarChart3",
                        title: t("Multiple Frameworks"),
                        description: t("React, Next.js, and Vite compatibility for flexible development.")
                    },
                    {
                        iconName: "Palette",
                        title: t("Modern Tech Stack"),
                        description: t("Built with shadcn/ui, Tailwind CSS, and TypeScript.")
                    },
                    {
                        iconName: "Users",
                        title: t("Responsive Design"),
                        description: t("Mobile-first components for all screen sizes and devices.")
                    },
                    {
                        iconName: "Database",
                        title: t("Developer-Friendly"),
                        description: t("Clean code, well-documented, easy integration and customization.")
                    }
                ],
                buttons: [
                    {
                        text: t("View Documentation"),
                        href: "#",
                        variant: "default" as const
                    },
                    {
                        text: t("GitHub Repository"),
                        href: "https://github.com/silicondeck/shadcn-dashboard-landing-template",
                        variant: "outline" as const,
                        target: "_blank" as const
                    }
                ]
            }
        ]
    };

    // --- 构造 Testimonials 数据 ---
    const HOME_TESTIMONIALS_DATA = {
        header: {
            badge: t("Testimonials"),
            title: t("Empowering Innovation Worldwide"),
            description: t("Join thousands of developers and teams who trust our platform to build exceptional digital experiences.")
        },
        items: [
            {
                name: 'Alexandra Mitchell',
                role: t('Senior Frontend Developer'),
                image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-1',
                quote: t('This platform has completely transformed our development workflow. The component system is so well-architected that even complex applications feel simple to build.')
            },
            {
                name: 'James Thompson',
                role: t('Technical Lead'),
                image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
                quote: t('After trying countless frameworks, this is the one that finally clicked. The documentation is exceptional.')
            },
        ]
    };

    const HOME_CTA_DATA = {
        badge: t("Productivity Suite"),
        stats: [
            { value: "150+", label: t("Blocks") },
            { value: "25K+", label: t("Downloads") },
            { value: "4.9★", label: t("Rating") }
        ],
        title: t("Supercharge your team's performance today"),
        description: t("Stop building from scratch. Get production-ready components that integrate seamlessly with your shadcn/ui projects."),
        buttons: [
            {
                text: t("Browse Components"),
                href: "/blocks",
                variant: "default" as const,
                iconName: "Package"
            },
            {
                text: t("View on GitHub"),
                href: "https://github.com/...",
                variant: "outline" as const,
                iconName: "Github"
            }
        ],
        trustText: [
            { text: t("Free components available") },
            { text: t("Commercial license included") },
            { text: t("Regular updates") }
        ]
    };

    const HOME_FAQ_DATA = {
        header: {
            badge: t("FAQ"),
            title: t("Frequently Asked Questions"),
            description: t("Everything you need to know about ShadcnStore components, licensing, and integration. Still have questions? We're here to help!")
        },
        items: [
            {
                question: t("How do I integrate ShadcnStore components into my project?"),
                answer: t("Integration is simple! All our components are built with shadcn/ui and work with React, Next.js, and Vite. Just copy the component code, install any required dependencies, and paste it into your project. Each component comes with detailed installation instructions and examples.")
            },
            {
                question: t("What's the difference between free and premium components?"),
                answer: t("Free components include essential UI elements like buttons, forms, and basic layouts. Premium components offer advanced features like complex data tables, analytics dashboards, authentication flows, and complete admin templates. Premium also includes Figma files, priority support, and commercial licenses.")
            },
            {
                question: t("Can I use these components in commercial projects?"),
                answer: t("Yes! Free components come with an MIT license for unlimited use. Premium components include a commercial license that allows usage in client projects, SaaS applications, and commercial products without attribution requirements.")
            },
            {
                question: t("Do you provide support and updates?"),
                answer: t("Absolutely! We provide community support for free components through our Discord server and GitHub issues. Premium subscribers get priority email support, regular component updates, and early access to new releases. We also maintain compatibility with the latest shadcn/ui versions.")
            },
            {
                question: t("What frameworks and tools do you support?"),
                answer: t("Our components work with React 18+, Next.js 13+, and Vite. We use TypeScript, Tailwind CSS, and follow shadcn/ui conventions. Components are tested with popular tools like React Hook Form, TanStack Query, and Zustand for state management.")
            },
            {
                question: t("How often do you release new components?"),
                answer: t("We release new components and templates weekly. Premium subscribers get early access to new releases, while free components are updated regularly based on community feedback. You can track our roadmap and request specific components through our GitHub repository.")
            }
        ]
    };

    return <HomeLandingTemplate
        heroData={{
            badge: t('New: Premium Template Collection'),
            title: (
                <>
                    <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {t(' Video Applications ')}
                    </span>
                    {t('with Ease')}
                </>
            ),
            description: t('Accelerate your development with our curated collection...'),
            ctaPrimary: t('Get Started Free'),
            ctaSecondary: t('Watch Demo')
        }}
        statsData={[
                {
                    iconName: 'Package',
                    value: t('500+'),
                    label: t('Components'),
                    description: t('Ready-to-use blocks')
                },
                {
                    iconName: 'Download',
                    value: t('25K+'),
                    label: t('Downloads'),
                    description: t('Trusted worldwide')
                },
                {
                    iconName: 'Users',
                    value: t('10K+'),
                    label: t('Developers'),
                    description: t('Active community')
                },
                {
                    iconName: 'Star',
                    value: t('4.9'),
                    label: t('Rating'),
                    description: t('User satisfaction')
                }
            ]
        }
        aboutData={ HOME_ABOUT_DATA }
        futureData={ HOME_FEATURES_DATA }
        testimonialsData={ HOME_TESTIMONIALS_DATA }
        ctaData={ HOME_CTA_DATA }
        faqData={ HOME_FAQ_DATA }
    />
}
