import type {Metadata} from "next";
import "../globals.css";
import React from 'react'
import {ThemeProvider} from "@/components/common/theme-provider";
import {SidebarConfigProvider} from "@/contexts/sidebar-context";
import {inter} from "@/lib/fonts";
import {siteConfig} from "@/config/site";
import {fallbackLng} from "@/i18n/settings";
import {TranslationsProvider} from "@/i18n/client";
import {dir} from 'i18next';
import {Toaster} from "sonner";

type Props = {
    params: { lang: string };
};

export async function generateMetadata({params}: Props): Promise<Metadata> {
    // 1. 获取当前语言 (Next.js 15+ 需要 await params)
    const {lang} = await params;

    // 2. 初始化翻译 (使用 'seo' namespace 或 'common'，取决于你把 metadata 翻译放在哪)
    // 如果你使用“原文即 Key”模式，可以直接写英文

    // 3. 计算 Canonical URL (关键 SEO 逻辑)
    // 如果是默认语言(en)，Canonical 指向根目录 '/'
    // 如果是其他语言(zh)，Canonical 指向 '/zh'
    const canonicalPath = lang === fallbackLng ? '/' : `/${lang}`;

    // 4. 计算 Open Graph Locale
    const ogLocale = lang === 'zh' ? 'zh_CN' : 'en_US';

    return {
        metadataBase: new URL(siteConfig.url),

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
            title: siteConfig.name,
            description: siteConfig.description,
            siteName: siteConfig.name,
            images: [
                {
                    url: siteConfig.ogImage,
                    width: 1200,
                    height: 630,
                    alt: siteConfig.name,
                },
            ],
        },

        // Twitter 卡片
        twitter: {
            card: "summary_large_image",
            title: siteConfig.name,
            description: siteConfig.description,
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
    params: Promise<{ lang: string }>;
}) {
    const {lang} = await params;

    return (
        <html className={`${inter.variable} antialiased`} lang={lang} dir={dir(lang)} suppressHydrationWarning>
        <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
            <SidebarConfigProvider>
                <TranslationsProvider
                    locale={lang}
                    namespaces={i18nNamespaces}
                >
                    {children}

                    <Toaster position="top-center" richColors />
                </TranslationsProvider>
            </SidebarConfigProvider>
        </ThemeProvider>
        </body>
        </html>
    );
}
