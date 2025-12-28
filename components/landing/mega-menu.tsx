"use client"
import { LucideIcon } from 'lucide-react'
import { I18nLink } from "@/components/common/I18nLink";
import { Button } from "@/components/ui/premium-button"

export interface MenuItem {
    title: string;
    description: string;
    icon: LucideIcon;
    href: string;
}

export interface MenuSection {
    title: string;
    items: MenuItem[];
}

interface MegaMenuProps {
  data: MenuSection[];
}

export function MegaMenu({ data }: MegaMenuProps) {
  return (
    <div className="w-[700px] max-w-[95vw] p-4 sm:p-6 lg:p-8 bg-background">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
        {data.map((section) => (
          <div key={section.title} className="space-y-4 lg:space-y-6">
            {/* Section Header */}
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {section.title}
            </h3>

              {/* Section Links */}
              <div className="space-y-3 lg:space-y-4">
                  {section.items.map((item) => (
                      <Button
                          key={item.title}
                          variant="ghost"
                          size="layout"
                          asChild
                          className="group block whitespace-normal space-y-1 lg:space-y-2 hover:bg-accent rounded-md p-2 lg:p-3 -mx-2 lg:-mx-3 transition-colors my-0"
                      >
                          <I18nLink href={item.href}>
                              {/* 这里包裹内容的容器 */}
                              <div className="flex items-center gap-2 lg:gap-3">
                                  <item.icon
                                      className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0"/>
                                  <span
                                      className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                    {item.title}
                                  </span>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed ml-6 lg:ml-7">
                                  {item.description}
                              </p>
                          </I18nLink>
                      </Button>))}
              </div>
          </div>
        ))}
      </div>
    </div>
  )
}
