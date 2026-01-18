import React from 'react'
import { ArrowRight, TrendingUp, CheckCircle2, LucideIcon, Sparkles, Zap } from 'lucide-react'
import { Button } from '@/components/ui/premium-button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

// --- 1. 图标映射 ---
const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp, Sparkles, Zap, ArrowRight, CheckCircle2
}

// --- 2. 数据接口定义 ---
export interface CtaButton {
  text: string;
  href: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  iconName?: string; // 按钮图标
  isScroll?: boolean; // 关键：是否是页内滚动链接
}

export interface TrustItem {
  text: string;
  iconName?: string; // 小图标，如绿色的勾
}

export interface CtaSectionProps {
  data?: {
    badge?: string; // 顶部的 "Productivity Suite"
    title: string;
    description: string;

    // 统计数据 (可选，原来的 150+ Blocks)
    stats?: Array<{ label: string; value: string }>;

    // 按钮组
    buttons: CtaButton[];

    // 底部信任条 (Free components available...)
    trustText?: TrustItem[];
  }
}

export function CTASection({ data }: CtaSectionProps) {
  if (!data) return null;

  const { badge, title, description, stats, buttons, trustText } = data;

  return (
      <section className='py-16 lg:py-24 bg-background'>
        <div className='container mx-auto px-4 lg:px-8'>
          <div className='mx-auto max-w-4xl'>
            <div className='text-center'>
              <div className='space-y-8'>

                {/* 1. Badge & Stats (可选) */}
                {(badge || (stats && stats.length > 0)) && (
                    <div className='flex flex-col items-center gap-4'>
                      {badge && (
                          <Badge variant='outline' className='flex items-center gap-2 px-3 py-1 text-sm'>
                            <Sparkles className='size-3.5 text-primary' />
                            {badge}
                          </Badge>
                      )}

                      {stats && stats.length > 0 && (
                          <div className='text-muted-foreground flex flex-wrap justify-center items-center gap-4 text-sm font-medium'>
                            {stats.map((stat, idx) => (
                                <React.Fragment key={idx}>
                                  <span className='flex items-center gap-1.5'>
                                    {idx === 0 && <div className='size-2 rounded-full bg-green-500' />}
                                    <span className="text-foreground">{stat.value}</span> {stat.label}
                                  </span>
                                  {/* 最后一个不加分隔符 */}
                                  {idx !== stats.length - 1 && (
                                      <Separator orientation='vertical' className='h-4 hidden sm:block' />
                                  )}
                                </React.Fragment>
                            ))}
                          </div>
                      )}
                    </div>
                )}

                {/* 2. 核心文案 */}
                <div className='space-y-6'>
                  <h2 className='text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl'>
                    {/* 这里简单处理，如果想做渐变字，可以在数据库存 HTML 字符串并用 dangerouslySetInnerHTML，或者简单点只用纯文本 */}
                    {title}
                  </h2>

                  <p className='text-muted-foreground mx-auto max-w-2xl text-balance text-lg'>
                    {description}
                  </p>
                </div>

                {/* 3. 按钮组 */}
                <div className='flex flex-col justify-center gap-4 sm:flex-row sm:gap-6 pt-4'>
                  {buttons.map((btn, idx) => {
                    const Icon = btn.iconName ? ICON_MAP[btn.iconName] : null;

                    // 判断是否是锚点链接 (#top)
                    const isAnchor = btn.href.startsWith('#');

                    return (
                        <Button
                            key={idx}
                            variant={btn.variant || 'default'}
                            className={cn(
                                'cursor-pointer px-8 py-6 text-lg font-medium shadow-sm',
                                btn.variant === 'default' && 'shadow-primary/25'
                            )}
                            asChild
                        >
                          <a
                              href={btn.href}
                              // 如果是外部链接，新窗口打开
                              target={(!isAnchor && btn.href.startsWith('http')) ? '_blank' : '_self'}
                              rel={(!isAnchor && btn.href.startsWith('http')) ? 'noopener noreferrer' : undefined}
                          >
                            {Icon && <Icon className='me-2 size-5' />}
                            {btn.text}
                            {!Icon && btn.variant === 'default' && <ArrowRight className='ms-2 size-4' />}
                          </a>
                        </Button>
                    );
                  })}
                </div>

                {/* 4. 底部信任背书 (Trust Indicators) */}
                {trustText && trustText.length > 0 && (
                    <div className='text-muted-foreground flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm mt-8'>
                      {trustText.map((item, idx) => {
                        // 支持配置图标，或者默认用 CheckCircle
                        const TrustIcon = item.iconName ? ICON_MAP[item.iconName] : CheckCircle2;

                        return (
                            <div key={idx} className='flex items-center gap-2'>
                              <TrustIcon className='size-4 text-green-600 dark:text-green-400' />
                              <span>{item.text}</span>
                            </div>
                        )
                      })}
                    </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </section>
  )
}