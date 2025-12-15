import type { Metadata } from "next";
import "./globals.css";
import React from 'react'
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { inter } from "@/lib/fonts";
import {siteConfig} from "@/config/site";

export const metadata: Metadata = {
    // ⚠️ 核心配置：解决 Canonical 和 OG 图片路径问题的关键
    metadataBase: new URL(siteConfig.url),

    title: {
        default: siteConfig.name,
        template: `%s | ${siteConfig.name}`, // 子页面标题模板
    },
    description: siteConfig.description,
    keywords: ["Next.js", "React", "Tailwind CSS", "Server Components", "Radix UI", "Admin Template"],

    authors: [
        {
            name: "Your Name",
            url: "https://your-personal-site.com",
        },
    ],
    creator: "Your Name",

    // 设置为 './' 后，Next.js 会根据当前页面的路由自动生成完整的规范链接
    // 例如访问 /about，它会自动生成 <link rel="canonical" href="https://.../about" />
    alternates: {
        canonical: './',
    },

    // 社交媒体分享 (Open Graph)
    openGraph: {
        type: "website",
        locale: "en_US",
        url: siteConfig.url,
        title: siteConfig.name,
        description: siteConfig.description,
        siteName: siteConfig.name,
        images: [
            {
                url: siteConfig.ogImage, // 解析为: https://your-domain.com/og-image.jpg
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

    // 图标 (如果 public 文件夹里没有对应的文件，可以在这里手动指定)
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
    },

    // 爬虫控制
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
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <SidebarConfigProvider>

            {children}

          </SidebarConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
