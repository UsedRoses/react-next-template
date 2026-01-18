import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SeoLandingTemplate } from "@/components/landing/seo-landing-template";
import { ToolWorkspace } from "@/components/tools/ToolWorkspace";
import { Metadata } from "next";
import { fallbackLng } from "@/i18n/settings";

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
        openGraph: {
            images: page.og_image ? [page.og_image] : [],
        },
        alternates: {
            canonical: page.canonical_url || (lang === fallbackLng) ? `/${slug}` : `/${lang}/${slug}`,
        }
    };
}

// 2. 页面主入口
export default async function ToolPage({params}: { params: Promise<{ lang: string, slug: string }> }) {
    const { lang, slug } = await params;

    // 查询数据库：一次性查出 路由 + 工具骨架 + 内容
    const pageData = await prisma.seo_pages.findUnique({
        where: { lang_slug: { lang, slug } },
        include: {
            tool: true,   // 关联 seo_tools
            content: true // 关联 seo_page_contents
        }
    });

    if (!pageData || !pageData.content) return notFound();

    // --- 核心逻辑：配置合并 (The Merge) ---
    const structure = pageData.tool.structure_config as any; // 获取骨架
    const overrides = (pageData.content.ui_overrides_json as any) || {}; // 获取翻译补丁

    const finalToolConfig = {
        ...structure,
        // 注入 API Action，让前端知道调哪个后端逻辑
        api_action: pageData.tool.api_action,
        // 遍历每一个字段，注入翻译
        fields: structure.fields.map((field: any) => {
            // 查找当前页面是否有针对该组件的覆盖配置
            const override = overrides[field.id] || {};
            return {
                ...field,
                ui_props: {
                    ...field.ui_props,
                    ...override // 覆盖 label, placeholder 等
                }
            };
        })
    };

    return (
        // 使用布局组件包裹
        <SeoLandingTemplate seoContent={pageData.content.seo_content_json} toolSlot={<ToolWorkspace toolConfig={finalToolConfig} />}/>
    );
}