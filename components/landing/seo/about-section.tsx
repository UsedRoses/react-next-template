import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CardDecorator } from '@/components/ui/card-decorator'
import {
  Code,
  Palette,
  Layout,
  Crown,
  LucideIcon,
  MessageSquare // Discord 图标通常用 MessageSquare 或类似替代，或者你可以单独引 Discord 图标
} from 'lucide-react'

// --- 1. 图标映射表 ---
const ICON_MAP: Record<string, LucideIcon> = {
  Code, Palette, Layout, Crown, MessageSquare
}

// --- 2. 数据类型定义 ---
export interface AboutValueItem {
  iconName: string;
  title: string;
  description: string;
}

export interface AboutButton {
  text: string;
  href: string;
  iconName?: string; // 按钮也可以带图标
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export interface AboutSectionProps {
  data?: {
    header: {
      badge: string;
      title: string;
      description: string;
    };
    values: AboutValueItem[];
    cta: {
      footerText?: string;
      buttons: AboutButton[];
    };
  }
}

export function AboutSection({ data }: AboutSectionProps) {
  // 数据判空保护
  if (!data) return null;

  const { header, values, cta } = data;

  return (
      <section id="about" className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mx-auto max-w-4xl text-center mb-16">
            {header.badge && (
                <Badge variant="outline" className="mb-4">
                  {header.badge}
                </Badge>
            )}
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
              {header.title}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {header.description}
            </p>
          </div>

          {/* Modern Values Grid */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 xl:grid-cols-4 mb-12">
            {values.map((value, index) => {
              const Icon = ICON_MAP[value.iconName] || Code; // 默认图标防崩

              return (
                  <Card key={index} className='group shadow-xs py-2'>
                    <CardContent className='p-8'>
                      <div className='flex flex-col items-center text-center'>
                        <CardDecorator>
                          <Icon className='h-6 w-6' aria-hidden="true" />
                        </CardDecorator>
                        <h3 className='mt-6 font-medium text-balance'>{value.title}</h3>
                        <p className='text-muted-foreground mt-3 text-sm'>{value.description}</p>
                      </div>
                    </CardContent>
                  </Card>
              )
            })}
          </div>

          {/* Call to Action */}
          <div className="mt-16 text-center">
            {cta.footerText && (
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-muted-foreground">{cta.footerText}</span>
                </div>
            )}

            {cta.buttons && cta.buttons.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {cta.buttons.map((btn, idx) => {
                    const BtnIcon = btn.iconName ? ICON_MAP[btn.iconName] : null;

                    return (
                        <Button
                            key={idx}
                            size="lg"
                            variant={btn.variant || 'default'}
                            className="cursor-pointer"
                            asChild
                        >
                          <a href={btn.href} target="_blank" rel="noopener noreferrer">
                            {BtnIcon && <BtnIcon className="mr-2 h-4 w-4" />}
                            {btn.text}
                          </a>
                        </Button>
                    )
                  })}
                </div>
            )}
          </div>
        </div>
      </section>
  )
}