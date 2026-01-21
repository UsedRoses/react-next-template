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

    // 这是一个事件处理函数 (Event Handler)
    // Compiler 知道这里面发生 Side Effect (修改 Cookie) 是安全的
    const handleLocaleChange = (newLocale: string) => {
        if (!pathname || newLocale === currentLocale) return

        // 1. 路径处理逻辑
        const isLocaleSegment = languages.includes(firstSegment)
        const pureSegments = isLocaleSegment ? ["", ...segments.slice(2)] : segments

        // 过滤空字符串并重新组合成路径（确保是以 / 开头）
        let purePath = pureSegments.join('/') || '/'
        // 修复可能出现的双斜杠情况
        purePath = purePath.replace(/\/+$/, '') || '/'

        const newPath = newLocale === fallbackLng
            ? purePath
            : purePath === '/' ? `/${newLocale}` : `/${newLocale}${purePath}`

        // 计算 365 天后的过期时间
        const date = new Date()
        date.setTime(date.getTime() + 365 * 24 * 60 * 60 * 1000)
        const expires = '; expires=' + date.toUTCString()

        // 直接修改 document.cookie 在事件回调中是合法的
        document.cookie = `${cookieName}=${newLocale}${expires}; path=/`

        // 3. 导航逻辑
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