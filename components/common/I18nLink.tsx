'use client'

import React, { forwardRef, ComponentProps, useContext, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation'
import { TransitionContext } from './transition-provider'

interface I18nLinkProps extends ComponentProps<typeof Link> {
    // 允许传入 keepQuery 等自定义参数，如果需要的话
}

export const I18nLink = React.memo(forwardRef<HTMLAnchorElement, I18nLinkProps>(
    ({ href, children, onClick, replace, scroll, prefetch, ...props }, ref) => {
        const router = useRouter()
        const params = useParams()
        const pathname = usePathname()
        const searchParams = useSearchParams()
        const transition = useContext(TransitionContext)

        const lang = (params?.lang as string) || 'en'

        // 1. URL 计算逻辑
        // 使用 useMemo 并非为了性能，而是为了引用稳定性，避免 Link 内部非必要的重渲染
        const localizedHref = useMemo(() => {
            let pathString = ''

            // --- 修复坑位 1：支持对象类型的 href ---
            if (typeof href === 'object') {
                pathString = href.pathname || ''
                // 如果对象里有 query，简单尝试还原 (复杂对象建议外部直接传字符串)
                if (href.query && typeof href.query === 'object') {
                    const q = new URLSearchParams(href.query as any).toString()
                    if (q) pathString += `?${q}`
                }
            } else {
                pathString = href || ''
            }

            if (!pathString) return ''

            // 外部链接或特殊协议直接返回
            if (pathString.match(/^(http|mailto:|tel:|#)/)) {
                return pathString
            }

            // 确保以 / 开头
            const path = pathString.startsWith('/') ? pathString : `/${pathString}`

            // 处理多语言
            if (lang === 'en') return path
            return path === '/' ? `/${lang}` : `/${lang}${path}`
        }, [href, lang])

        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            // 先执行用户传入的 onClick (如果有)
            if (onClick) onClick(e)

            // 如果用户已经阻止了默认行为，我们就不再处理
            if (e.defaultPrevented) return

            // 如果是以下情况，不做任何处理，直接交给浏览器或原生 Link：
            // 1. 目标是新窗口 (_blank)
            // 2. 按下了功能键 (Meta/Ctrl/Shift/Alt) -> 用户想在新标签页打开
            // 3. 是锚点跳转 (#)
            if (
                props.target === '_blank' ||
                e.metaKey ||
                e.ctrlKey ||
                e.shiftKey ||
                e.altKey ||
                (localizedHref.startsWith('#'))
            ) {
                return
            }

            try {
                const currentUrl = new URL(pathname + (searchParams?.toString() ? `?${searchParams}` : ''), window.location.origin)
                const targetUrl = new URL(localizedHref, window.location.origin)

                // 逻辑：如果长度大于1且以 / 结尾，去掉它。例如 "/zh/" -> "/zh"
                const normalize = (p: string) => (p.length > 1 && p.endsWith('/')) ? p.slice(0, -1) : p;

                const currentPath = normalize(currentUrl.pathname)
                const targetPath = normalize(targetUrl.pathname)

                // 还要处理 URL 编码问题 (比如中文路径)，decodeURIComponent 比较更安全
                // 通常 pathname 已经是解码过的，但为了保险起见，可以加上
                if (
                    decodeURIComponent(currentPath) === decodeURIComponent(targetPath) &&
                    currentUrl.search === targetUrl.search
                ) {
                    e.preventDefault()
                    return // 是同一页，且参数也相同，阻断跳转
                }
            } catch (error) {
            }

            // --- 劫持跳转，插入动画 ---
            e.preventDefault() // 阻止 Next.js Link 的立即跳转

            if (transition) {
                // 使用过渡动画跳转
                transition.navigateWithAnimation(localizedHref)
            } else {
                // 降级：没有动画上下文时，手动调用 router 方法
                // 保持与 Next.js Link props 一致的行为 (replace / scroll)
                if (replace) {
                    router.replace(localizedHref, { scroll: scroll ?? true })
                } else {
                    router.push(localizedHref, { scroll: scroll ?? true })
                }
            }
        }

        // 保留默认行为，但增加一个悬停预加载的触发器
        const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
            props.onMouseEnter?.(e)
            // 当关闭自动prefetch时, 当用户鼠标真的放上去时，手动触发 prefetch
            if (prefetch === false) {
                router.prefetch(localizedHref)
            }
        }

        return (
            /*
               直接利用原生 Link 的所有能力
               - 我们把 localizedHref 传给 Link，Next.js 会自动处理 SEO (href 属性)
               - Next.js 会自动处理 Viewport Prefetching (视口预加载)，不需要我们手动 router.prefetch
               - 我们只拦截 onClick
            */
            <Link
                {...props}
                ref={ref}
                href={localizedHref}
                onClick={handleClick}
                replace={replace}
                scroll={scroll}
                onMouseEnter={handleMouseEnter}
                prefetch={prefetch} // 透传 prefetch 设置
            >
                {children}
            </Link>
        )
    }
))
