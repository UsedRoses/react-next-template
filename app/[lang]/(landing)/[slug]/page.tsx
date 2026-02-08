import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SeoLandingTemplate } from "@/components/landing/seo-landing-template";
import { ToolWorkspace } from "@/components/tools/tool-workspace";
import { Metadata } from "next";
import { fallbackLng } from "@/i18n/settings";
import { mergeToolConfig } from "@/hooks/use-tool-store";

// 1. 设置为 false，代表“无限期缓存”，除非手动清除
export const revalidate = false;

// 2. 动态参数控制
// true (默认): 允许访问 generateStaticParams 里没返回的路径（第一次访问时生成并缓存）
// false: 只有 generateStaticParams 返回的路径能访问，其他 404
export const dynamicParams = true;

// 3. 预生成列表
// 返回 [] 意味着：构建时不生成任何页面。
export async function generateStaticParams() {
    return [];
}

// 1. 动态生成 SEO Metadata
export async function generateMetadata({params}: { params: Promise<{ lang: string, slug: string }> }): Promise<Metadata> {
    const { lang, slug } = await params;
    const page = await prisma.seo_pages.findUnique({
        where: { lang_slug: { lang, slug } },
        select: { meta_title: true, meta_description: true, og_image: true, canonical_url: true }
    });
    if (!page) return {};
    return {
        title: page.meta_title,
        description: page.meta_description,
        openGraph: { images: page.og_image ? [page.og_image] : [] },
        alternates: { canonical: page.canonical_url || (lang === fallbackLng ? `/${slug}` : `/${lang}/${slug}`) }
    };
}

// 2. 页面主入口
export default async function ToolPage({params}: { params: Promise<{ lang: string, slug: string }> }) {
    const { lang, slug } = await params;

    const pageData = await prisma.seo_pages.findUnique({
        where: { lang_slug: { lang, slug } },
        include: {
            tool: true,
            content: true
        }
    });

    if (!pageData || !pageData.content) return notFound();

    // --- 使用合并 ---
    const structure = pageData.tool.structure_config as any;
    const overrides = pageData.content.ui_overrides_json as any;

    // 这将返回一个已经翻译好的、包含完整逻辑的配置对象
    const finalToolConfig = mergeToolConfig(structure, overrides);
    // 注入必要的 API Action
    finalToolConfig.api_action = pageData.tool.api_action;

    // --- 结构化提取 SEO 内容 ---
    // 防止直接传整个 JSON 导致类型混乱，提取 UI 需要的部分
    const seoContentJson = pageData.content.seo_content_json as any;

    // 提取 Guide 数据 (假设数据库存的是 how_to 区块)
    const guideData = {
        title: seoContentJson?.how_to?.title,       // "如何使用"
        subtitle: seoContentJson?.how_to?.subtitle, // "三步简单操作..."
        steps: seoContentJson?.how_to?.steps        // [{title, desc, icon}, ...]
    };

    return (
        <SeoLandingTemplate
            seoContent={seoContentJson}
            toolSlot={
                <ToolWorkspace
                    toolConfig={finalToolConfig}
                    guideData={guideData} // 明确传递 Guide 数据
                />
            }
        />
    );
}