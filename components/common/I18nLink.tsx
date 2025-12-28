'use client'

import React, { forwardRef, ComponentProps, useContext } from 'react'
import Link from 'next/link'
import { useParams, useRouter, usePathname } from 'next/navigation' // 引入 usePathname
import { TransitionContext } from './transition-provider'

interface I18nLinkProps extends ComponentProps<typeof Link> {}

export const I18nLink = forwardRef<HTMLAnchorElement, I18nLinkProps>(
    ({ href, children, onClick, onMouseEnter, ...props }, ref) => {
        const params = useParams()
        const router = useRouter()
        const currentPathname = usePathname() // 获取当前实际路径
        const transition = useContext(TransitionContext)

        const lang = (params?.lang as string) || 'en'

        // --- 多语言 URL 处理逻辑 ---
        const getLocalizedHref = (originalHref: any): string => {
            if (typeof originalHref !== 'string') return String(originalHref)
            if (
                originalHref.startsWith('http') ||
                originalHref.startsWith('mailto:') ||
                originalHref.startsWith('tel:') ||
                originalHref.startsWith('#')
            ) {
                return originalHref
            }
            const path = originalHref.startsWith('/') ? originalHref : `/${originalHref}`
            if (lang === 'en') return path
            return path === '/' ? `/${lang}` : `/${lang}${path}`
        }

        const localizedHref = getLocalizedHref(href)

        // --- 性能优化：悬停预加载 ---
        const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
            onMouseEnter?.(e)
            if (typeof localizedHref === 'string' && !localizedHref.startsWith('#')) {
                router.prefetch(localizedHref)
            }
        }

        const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
            if (onClick) onClick(e);

            // 1. 如果是特殊链接，不处理
            if (props.target === '_blank' || localizedHref.startsWith('#') || e.metaKey || e.ctrlKey) {
                return
            }

            const normalize = (p: string) => p.replace(/\/$/, "") || "/";
            const isSamePath = normalize(localizedHref) === normalize(currentPathname);

            if (isSamePath) {
                e.preventDefault();
                // 如果是在当前页点击，我们可以做一个微弱的震动效果或者干脆什么都不做
                return;
            }

            e.preventDefault()

            // 3. 执行动画跳转
            if (transition) {
                transition.navigateWithAnimation(localizedHref)
            } else {
                router.push(localizedHref)
            }
        }

        return (
            <Link
                {...props}
                ref={ref}
                href={localizedHref}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
            >
                {children}
            </Link>
        )
    }
)

I18nLink.displayName = 'I18nLink'