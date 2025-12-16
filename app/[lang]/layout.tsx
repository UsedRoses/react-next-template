import type {Metadata} from "next";
import "../globals.css";
import React from 'react'
import {ThemeProvider} from "@/components/theme-provider";
import {SidebarConfigProvider} from "@/contexts/sidebar-context";
import {inter} from "@/lib/fonts";
import {siteConfig} from "@/config/site";
import {useTranslation} from "@/i18n/server";
import {fallbackLng} from "@/i18n/settings";
import {TranslationsProvider} from "@/i18n/client";
import {dir} from 'i18next';

type Props = {
    params: { lang: string };
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
    // 1. 获取当前语言 (Next.js 15+ 需要 await params)
    const {lang} = await params;

    // 2. 初始化翻译 (使用 'seo' namespace 或 'common'，取决于你把 metadata 翻译放在哪)
    // 如果你使用“原文即 Key”模式，可以直接写英文
    const {t} = await useTranslation(lang, 'translation');

    // 3. 计算 Canonical URL (关键 SEO 逻辑)
    // 如果是默认语言(en)，Canonical 指向根目录 '/'
    // 如果是其他语言(zh)，Canonical 指向 '/zh'
    const canonicalPath = lang === fallbackLng ? '/' : `/${lang}`;

    // 4. 计算 Open Graph Locale
    const ogLocale = lang === 'zh' ? 'zh_CN' : 'en_US';

    return {
        metadataBase: new URL(siteConfig.url),

        // 翻译标题和描述
        title: {
            default: t(siteConfig.name), // 或者 t('My Awesome Site')
            template: `%s | ${t(siteConfig.name)}`,
        },
        description: t(siteConfig.description), // 或者 t('Best Next.js template...')

        keywords: [], // 也可以翻译 t('keywords')

        authors: [{name: "Your Name", url: "https://your-personal-site.com"}],
        creator: "Your Name",

        // 核心修改：SEO 链接配置
        alternates: {
            // 这里的 . 并不够准确，我们需要根据语言显式指定
            // 当 lang='en' 时，它会指向 https://domain.com/
            // 当 lang='zh' 时，它会指向 https://domain.com/zh
            canonical: canonicalPath,

            // 告诉搜索引擎存在其他语言版本 (Hreflang)
            languages: {
                'en': '/',    // 英文对应根路径
                'zh': '/zh',  // 中文对应 /zh
            },
        },

        // 社交媒体分享 (Open Graph)
        openGraph: {
            type: "website",
            locale: ogLocale, // 动态 locale
            url: canonicalPath, // 确保分享出去的链接也是对的
            title: t(siteConfig.name),
            description: t(siteConfig.description),
            siteName: t(siteConfig.name),
            images: [
                {
                    url: siteConfig.ogImage,
                    width: 1200,
                    height: 630,
                    alt: t(siteConfig.name),
                },
            ],
        },

        // Twitter 卡片
        twitter: {
            card: "summary_large_image",
            title: t(siteConfig.name),
            description: t(siteConfig.description),
            images: [siteConfig.ogImage],
            creator: "@your_handle",
        },

        // 图标 (静态资源通常不需要变)
        icons: {
            icon: "/favicon.ico",
            shortcut: "/favicon-16x16.png",
            apple: "/apple-touch-icon.png",
        },

        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

const i18nNamespaces = ['translation'];


export default async function RootLayout({
                                             children,
                                             params,
                                         }: {
    children: React.ReactNode;
    params: { lang: string };
}) {
    const {lang} = await params;

    return (
        <html className={`${inter.variable} antialiased`} lang={lang} dir={dir(lang)}>
        <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
            <SidebarConfigProvider>
                <TranslationsProvider
                    locale={lang}
                    namespaces={i18nNamespaces}
                    resources={/* 这里可以是空的，因为我们在 client.tsx 里处理了加载，或者为了性能最好传进去 */ undefined}
                >
                    {children}
                </TranslationsProvider>
            </SidebarConfigProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
