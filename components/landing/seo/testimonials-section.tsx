import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

// --- 1. 定义数据类型 ---
export interface TestimonialItem {
  name: string;
  role: string;
  image: string; // 头像 URL
  quote: string; // 评价内容
}

export interface TestimonialsSectionProps {
  data?: {
    header: {
      badge?: string;
      title: string;
      description: string;
    };
    items: TestimonialItem[];
  };
}

// --- 2. 服务端组件实现 ---
export function TestimonialsSection({ data }: TestimonialsSectionProps) {
  // 数据判空
  if (!data || !data.items || data.items.length === 0) return null;

  const { header, items } = data;

  return (
      <section id="testimonials" className="py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
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

          {/*
           Masonry Grid (瀑布流布局)
           使用 CSS columns 实现，这在服务端渲染完全没问题
        */}
          <div className="columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 lg:gap-4">
            {items.map((testimonial, index) => (
                // break-inside-avoid 确保卡片不会被瀑布流截断
                <Card key={index} className="mb-6 break-inside-avoid shadow-none lg:mb-4 bg-card">
                  <CardContent className="pt-6"> {/* CardContent 默认有 padding，微调一下 */}
                    <div className="flex items-start gap-4">
                      <Avatar className="bg-muted size-12 shrink-0">
                        <AvatarImage
                            alt={testimonial.name}
                            src={testimonial.image}
                            loading="lazy"
                            width={120}
                            height={120}
                        />
                        <AvatarFallback>
                          {testimonial.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        {/* 移除 onClick，改为纯展示或有效链接 */}
                        <div className="font-medium text-foreground">
                          {testimonial.name}
                        </div>
                        <span className="text-muted-foreground block text-sm tracking-wide">
                      {testimonial.role}
                    </span>
                      </div>
                    </div>

                    <blockquote className="mt-4">
                      <p className="text-sm leading-relaxed text-muted-foreground text-balance">
                        "{testimonial.quote}"
                      </p>
                    </blockquote>
                  </CardContent>
                </Card>
            ))}
          </div>
        </div>
      </section>
  )
}