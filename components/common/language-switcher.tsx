'use client'

import * as React from "react"
import { usePathname } from "next/navigation"
import { Languages, Check } from "lucide-react"
import { Button } from "@/components/ui/premium-button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
// 导入你 i18n 配置中的语言列表
import { languages, fallbackLng, cookieName } from "@/i18n/settings"
import { useTransition } from "@/components/common/transition-provider"

export function LanguageSwitcher() {
    const pathname = usePathname()
    // 获取动画跳转函数
    const transition = useTransition()
    // 1. 分割路径
    const segments = pathname.split('/')
    const firstSegment = segments[1]

    const currentLocale = languages.includes(firstSegment) ? firstSegment : fallbackLng

    const getCookie = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
        return match ? match[2] : null
    }

    const handleLocaleChange = (newLocale: string) => {
        if (!pathname) return
        // 如果语言没变，不触发
        if (newLocale === currentLocale) return

        // 2. 检查第一段是否是【任何】已支持的语言 (en, zh, 等)
        const isLocaleSegment = languages.includes(segments[1])

        // 3. 提取纯净路径 (去除现有的语言前缀)
        const pureSegments = isLocaleSegment ? ["", ...segments.slice(2)] : segments

        // 过滤空字符串并重新组合成路径（确保是以 / 开头）
        let purePath = pureSegments.join('/') || '/'
        // 修复可能出现的双斜杠情况
        purePath = purePath.replace(/\/+$/, '') || '/'

        // 4. 根据目标语言构建新路径
        let newPath: string
        if (newLocale === fallbackLng) {
            newPath = purePath
        } else {
            newPath = purePath === '/' ? `/${newLocale}` : `/${newLocale}${purePath}`
        }

        // 如果 URL 里的语言跟 Cookie 不一样，就更新 Cookie
        const currentCookieValue = getCookie(cookieName)
        if (currentCookieValue !== newLocale) {
            const days = 365
            const date = new Date()
            date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
            const expires = '; expires=' + date.toUTCString()

            // 设置 Cookie
            document.cookie = `${cookieName}=${newLocale}${expires}; path=/`
        }

        const days = 365
        const date = new Date()
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
        const expires = '; expires=' + date.toUTCString()
        document.cookie = `${cookieName}=${newLocale}${expires}; path=/`

        if (transition) {
            transition.navigateWithAnimation(newPath)
        } else {
            // 兜底逻辑
            window.location.href = newPath
        }
    }

    // 辅助函数：将语言代码转换为直观名称
    const getLangName = (code: string) => {
        const names: Record<string, string> = {
            en: 'English',
            zh: '简体中文',
            ja: '日本語'
        }
        return names[code] || code.toUpperCase()
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="cursor-pointer focus-visible:ring-0">
                    <Languages className="h-4 w-4" />
                    <span className="hidden sm:inline">{getLangName(currentLocale)}</span>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-40 mt-2 border-border/50 bg-background/95 backdrop-blur-sm">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang}
                        onClick={() => handleLocaleChange(lang)}
                        className="cursor-pointer"
                    >
                        <span className={currentLocale === lang ? "font-bold text-primary" : ""}>
                          {getLangName(lang)}
                        </span>
                        {currentLocale === lang && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}