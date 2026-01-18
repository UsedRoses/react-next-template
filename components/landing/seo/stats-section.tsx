import * as Icons from 'lucide-react'
import {Card, CardContent} from '@/components/ui/card'
import {DotPattern} from '@/components/common/dot-pattern'

// 定义单个统计项的接口
export interface StatItem {
    iconName: keyof typeof Icons;
    value: string;
    label: string;
    description: string;
}

interface StatsSectionProps {
    data: StatItem[];
}

export function StatsSection({data}: StatsSectionProps) {
    return (
        <section className="py-12 sm:py-16 relative">
            {/* Background with transparency */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/8 via-transparent to-secondary/20"/>
            <div className="absolute inset-0 overflow-hidden">
                <DotPattern className="opacity-75" size="md" fadeStyle="circle"/>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
                {/* Stats Grid */}
                {/* 使用 grid-cols 的动态适配，如果 items 数量不同也能较好显示 */}
                <div className={`grid grid-cols-2 lg:grid-cols-${data.length > 4 ? 4 : data.length} gap-6 md:gap-8`}>
                    {data.map((item, index) => {
                        const Icon = (Icons[item.iconName] as Icons.LucideIcon) || Icons.HelpCircle; // 提取图标组件
                        return (
                            <Card
                                key={index}
                                className="text-center bg-background/60 backdrop-blur-sm border-border/50 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="flex justify-center mb-4">
                                        <div className="p-3 bg-primary/10 rounded-xl">
                                            <Icon className="h-6 w-6 text-primary"/>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">
                                            {item.value}
                                        </h3>
                                        <p className="font-semibold text-foreground">
                                            {item.label}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.description}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}