import type {Metadata} from 'next'
import {GeneralPageContent} from './components/general-template'
import {useTranslation} from '@/i18n/server';

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

    return <GeneralPageContent
        heroData={{
            badge: t('New: Premium Template Collection'),
            title: (
                <>
                    {t('Build Better')}
                    <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      {t(' Video Applications ')}
                    </span>
                    {t('with Ease')}
                </>
            ),
            description: t('Accelerate your development with our curated collection...'),
            ctaPrimary: t('Get Started Free'),
            ctaSecondary: t('Watch Demo')
        }}
        logoData={{
            subtitle: t('Trusted by leading companies worldwide')
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
    />
}
