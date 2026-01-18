import React from 'react'
import {
  BarChart3,
  Zap,
  Users,
  ArrowRight,
  Database,
  Package,
  Crown,
  Layout,
  Palette,
  LucideIcon,
  Star,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image3D } from '@/components/common/image-3d'
import { cn } from '@/lib/utils'

// --- 1. 图标映射表 (String -> Component) ---
// 数据库存的是字符串 "Zap", 这里把它变成组件 <Zap />
const ICON_MAP: Record<string, LucideIcon> = {
  Package, Crown, Layout, Zap,
  BarChart3, Palette, Users, Database,
  Star, Shield // 可以预埋更多
}

// --- 2. 类型定义 (Type Definitions) ---
export interface FeatureItem {
  iconName: string; // 对应 ICON_MAP 的 key
  title: string;
  description: string;
}

export interface FeatureButton {
  text: string;
  href: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
  target?: '_blank' | '_self';
}

export interface FeatureBlock {
  title: string;
  description: string;
  items: FeatureItem[]; // 4个小点
  buttons?: FeatureButton[];
  // 图片配置
  image: {
    lightSrc: string;
    darkSrc: string;
    alt: string;
    position: 'left' | 'right'; // 关键：控制图片在左还是右
  }
}

export interface FeaturesSectionProps {
  data?: {
    header?: {
      badge?: string;
      title: string;
      description: string;
    };
    blocks: FeatureBlock[];
  }
}

// --- 3. 组件实现 ---
export function FeaturesSection({ data }: FeaturesSectionProps) {
  // 如果没有数据，不渲染 (Null Safety)
  if (!data || !data.blocks) return null;

  const { header, blocks } = data;

  return (
      <section id="features" className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          {header && (
              <div className="mx-auto max-w-2xl text-center mb-16">
                {header.badge && (
                    <Badge variant="outline" className="mb-4">{header.badge}</Badge>
                )}
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                  {header.title}
                </h2>
                <p className="text-lg text-muted-foreground">
                  {header.description}
                </p>
              </div>
          )}

          {/* Feature Blocks Loop */}
          <div className="space-y-24">
            {blocks.map((block, blockIndex) => (
                <div key={blockIndex} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">

                  {/*
                 图片区域
                 利用 order 类名控制左右顺序 (Mobile first: 图片总是在上或下，这里通过 order 调整 PC 端位置)
              */}
                  <div className={cn(
                      block.image.position === 'left' ? "lg:order-1" : "lg:order-2 order-1"
                  )}>
                    <Image3D
                        lightSrc={block.image.lightSrc}
                        darkSrc={block.image.darkSrc}
                        alt={block.image.alt}
                        direction={block.image.position} // 复用 Image3D 的 direction
                    />
                  </div>

                  {/* 文本内容区域 */}
                  <div className={cn(
                      "space-y-6",
                      block.image.position === 'left' ? "lg:order-2" : "lg:order-1 order-2"
                  )}>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                        {block.title}
                      </h3>
                      <p className="text-muted-foreground text-base text-pretty">
                        {block.description}
                      </p>
                    </div>

                    <ul className="grid gap-4 sm:grid-cols-2">
                      {block.items.map((item, idx) => {
                        // 动态获取图标组件，如果没有找到则默认用 Package
                        const IconComponent = ICON_MAP[item.iconName] || Package;

                        return (
                            <li key={idx} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                              <div className="mt-0.5 flex shrink-0 items-center justify-center">
                                <IconComponent className="size-5 text-primary" aria-hidden="true" />
                              </div>
                              <div>
                                <h3 className="text-foreground font-medium">{item.title}</h3>
                                <p className="text-muted-foreground mt-1 text-sm">{item.description}</p>
                              </div>
                            </li>
                        )
                      })}
                    </ul>

                    {/* 按钮组 */}
                    {block.buttons && block.buttons.length > 0 && (
                        <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
                          {block.buttons.map((btn, btnIdx) => (
                              <Button key={btnIdx} size="lg" variant={btn.variant || 'default'} asChild className="cursor-pointer">
                                <a href={btn.href} target={btn.target || '_self'} className='flex items-center'>
                                  {btn.text}
                                  {/* 只有主按钮才加箭头，或者根据逻辑判断 */}
                                  {btn.variant !== 'outline' && <ArrowRight className="ms-2 size-4" />}
                                </a>
                              </Button>
                          ))}
                        </div>
                    )}
                  </div>
                </div>
            ))}
          </div>

        </div>
      </section>
  )
}