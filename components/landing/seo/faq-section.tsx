import { CircleHelp } from 'lucide-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

// --- 1. 定义数据接口 ---
export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqSectionProps {
  data?: {
    header: {
      badge?: string;
      title: string;
      description: string;
    };
    items: FaqItem[];
  };
}

// --- 2. 组件实现 ---
export function FaqSection({ data }: FaqSectionProps) {
  // 数据判空
  if (!data || !data.items || data.items.length === 0) return null;

  const { header, items } = data;

  return (
      <section id="faq" className="py-24 sm:py-32">
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

          {/* FAQ Content */}
          <div className="max-w-4xl mx-auto">
            <div className='bg-transparent'>
              <div className='p-0'>
                <Accordion type='single' collapsible className='space-y-5'>
                  {items.map((item, index) => (
                      // 使用 index 生成唯一的 value
                      <AccordionItem
                          key={index}
                          value={`item-${index}`}
                          className='rounded-md border! bg-card' // 显式指定背景色，防止透明穿透
                      >
                        <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b'>
                          <div className='flex items-center gap-4 text-left'>
                            <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                              <CircleHelp className='size-5' />
                            </div>
                            <span className='font-semibold text-foreground'>{item.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className='p-4 text-muted-foreground'>
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </div>

        </div>
      </section>
  )
}