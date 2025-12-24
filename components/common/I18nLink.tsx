'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ComponentProps } from 'react'

// 继承所有原生 Link 的属性类型
interface I18nLinkProps extends ComponentProps<typeof Link> {
    // 如果需要，可以在这里添加自定义属性
}

export function I18nLink({ href, children, ...props }: I18nLinkProps) {
    const params = useParams()
    // 获取当前语言 (默认 en)
    const lang = (params?.lang as string) || 'en'

    const getLocalizedHref = (originalHref: any): any => {
        // 1. 如果不是字符串（比如是 URL 对象），直接返回
        if (typeof originalHref !== 'string') return originalHref

        // 2. 如果是外部链接、邮件、电话或锚点，不处理
        if (
            originalHref.startsWith('http') ||
            originalHref.startsWith('mailto:') ||
            originalHref.startsWith('tel:') ||
            originalHref.startsWith('#')
        ) {
            return originalHref
        }

        // 3. 规范化路径：确保以 / 开头
        const path = originalHref.startsWith('/') ? originalHref : `/${originalHref}`

        // 4. 核心逻辑：默认语言(en)不加前缀，其他(zh)加前缀
        if (lang === 'en') {
            return path
        }

        // 处理根路径 / 避免生成 //zh
        return path === '/' ? `/${lang}` : `/${lang}${path}`
    }

    return (
        <Link
            {...props} // 这里会将 target, rel, className, prefetch 等属性原封不动传给 Link
            href={getLocalizedHref(href)}
        >
            {children}
        </Link>
    )
}