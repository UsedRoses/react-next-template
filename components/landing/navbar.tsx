"use client"

import { useMemo, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { I18nLink } from "@/components/common/I18nLink"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import {
  Menu,
  LayoutDashboard,
  ChevronDown,
  X,
  Moon,
  Sun,
  Package,
  Crown,
  BarChart3,
  Layout,
  Building2, Rocket, Shield, Database, Palette, Settings, Zap, ChevronDownIcon
} from 'lucide-react'
// import { Button } from '@/components/ui/button'
import { Button } from '@/components/ui/premium-button'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Logo } from '@/components/common/logo'
import { MegaMenu } from '@/components/landing/mega-menu'
import { ModeToggle } from '@/components/common/mode-toggle'
import { useTheme } from "next-themes"
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useTranslation} from 'react-i18next';

// Smooth scroll function
const smoothScrollTo = (targetId: string) => {
  if (targetId.startsWith('#')) {
    const element = document.querySelector(targetId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }
}

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [solutionsOpen, setSolutionsOpen] = useState(false)
  const { setTheme, theme } = useTheme()

  const { t, i18n } = useTranslation('navbar')

  const pathname = usePathname()
  // GSAP 容器引用
  const desktopNavRef = useRef(null)
  const mobileSheetRef = useRef(null)

  // 桌面端：初次加载时的 Stagger 动画
  useGSAP(() => {
    // 强制先重置所有动画元素的状态，防止状态残留导致消失
    const targets = gsap.utils.toArray(".gsap-reveal");
    if (targets.length === 0) return;
    gsap.set(targets, { opacity: 0, y: 8, scale: 0.98 });

    const timer = setTimeout(() => {
      gsap.to(targets, {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.05,
        duration: 0.5,
        ease: "power2.out",
        force3D: true, // 开启 3D 加速
        onStart: () => {
          // 动画开始时，临时降低模糊度或关闭某些滤镜以提升 FPS
          gsap.set(desktopNavRef.current, { backdropFilter: "blur(0px)" });
        },
        onComplete: () => {
          // 不要清理所有属性，只清理会导致渲染层级问题的属性
          gsap.set(targets, { clearProps: "y,scale" });
          if(desktopNavRef.current) {
            gsap.set(desktopNavRef.current, { backdropFilter: "blur(20px)" });
          }
        }
      });
    }, 50);

    return () => clearTimeout(timer);
  }, {
    dependencies: [pathname, i18n.resolvedLanguage],
    scope: desktopNavRef
  });

  // 移动端：当侧边栏打开时的 Stagger 动画
  useGSAP(() => {
    if (isOpen) {
      // 在 Sheet 打开后，稍微延迟执行，确保 Portal 已经把内容插进去了
      const timer = setTimeout(() => {
        const items = document.querySelectorAll(".gsap-mobile-link");
        if (items.length > 0) {
          gsap.fromTo(items,
              { x: -20, opacity: 0 },
              {
                x: 0,
                opacity: 1,
                stagger: 0.05,
                duration: 0.4,
                ease: "power2.out",
                overwrite: true
              }
          );
        }
      }, 100); // 100ms 的关键延迟

      return () => clearTimeout(timer);
    }
  }, { dependencies: [isOpen] });

  // 使用 useMemo 将菜单配置放入组件内部
  const navigationItems = useMemo(() => [
    { name: t('Home'), href: '/' },
    { name: t('Features'), href: '#features' },
    { name: t('Solutions'), href: '#features', hasMegaMenu: true },
    { name: t('Team'), href: '#team' },
    { name: t('Pricing'), href: '#pricing' },
    { name: t('FAQ'), href: '#faq' },
    { name: t('Contact'), href: '#contact' },
  ], [t])

  // 子菜单
  const solutionsItems = useMemo(() => [
    { title: t('Browse Products'),
      items: [{
          title: t('Free Blocks'),
          description: t('Essential UI components and sections'),
          icon: Package,
          href: '/test-video'
      },{
        title: t('Premium Templates'),
        description: t('Complete page templates and layouts'),
        icon: Crown,
        href: '#premium-templates'
      },{
        title: t('Admin Dashboards'),
        description: t('Full-featured dashboard solutions'),
        icon: BarChart3,
        href: '#admin-dashboards'
      },{
        title: t('Landing Pages'),
        description: t('Marketing and product landing templates'),
        icon: Layout,
        href: '#landing-pages'
      }]
    },
    { title: t('Categories'),
      items: [{
          title: t('E-commerce'),
          description: t('Online store admin panels and components'),
          icon: Building2,
          href: '#ecommerce'
        }, {
          title: t('SaaS Dashboards'),
          description: t('Application admin interfaces'),
          icon: Rocket,
          href: '#saas-dashboards'
        }, {
          title: t('Analytics'),
          description: t('Data visualization and reporting templates'),
          icon: BarChart3,
          href: '#analytics'
        }, {
          title: t('Authentication'),
          description: t('Login, signup, and user management pages'),
          icon: Shield,
          href: '#authentication'
        }]
    },
    { title: t('Resources'),
      items: [{
          title: t('Documentation'),
          description: t('Integration guides and setup instructions'),
          icon: Database,
          href: '#docs'
        }, {
          title: t('Component Showcase'),
          description: t('Interactive preview of all components'),
          icon: Palette,
          href: '#showcase'
        }, {
          title: t('GitHub Repository'),
          description: t('Open source foundation and community'),
          icon: Settings,
          href: '#github'
        }, {
          title: t('Design System'),
          description: t('shadcn/ui standards and customization'),
          icon: Zap,
          href: '#design-system'
        }]
    }
  ], [t])

  return (
    <header ref={desktopNavRef} className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/30 h-(--navbar-height)">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-full items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2 gsap-reveal">
          <I18nLink href="/" className="flex items-center space-x-2 cursor-pointer">
            <Logo size={32} />
            <span className="font-bold">
              ShadcnStore
            </span>
          </I18nLink>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.name} className="gsap-reveal">
                {item.hasMegaMenu ? (
                  <>
                    <NavigationMenuTrigger asChild className="bg-transparent hover:bg-transparent focus:bg-transparent data-active:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary cursor-pointer">
                      <Button variant="ghost">
                        {item.name}
                        <ChevronDownIcon
                            className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                        />
                      </Button>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <MegaMenu data={solutionsItems}/>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink asChild
                    className="group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none"
                  >
                    <Button variant="ghost" asChild className="cursor-pointer">
                      <I18nLink
                          href={item.href}
                          onClick={(e: React.MouseEvent) => {
                            // 这里的逻辑依然保留，用于拦截锚点链接
                            if (item.href.startsWith('#')) {
                              e.preventDefault();
                              smoothScrollTo(item.href);
                            }
                          }}
                      >
                        {item.name}
                      </I18nLink>
                    </Button>
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTA */}
        <div className="hidden xl:flex items-center space-x-2">
          <div className="gsap-reveal"><ModeToggle variant="ghost" /></div>
          <div className="gsap-reveal"><LanguageSwitcher /></div>
          <div className="gsap-reveal">
            <Button variant="outline" asChild className="cursor-pointer">
              <I18nLink href="/dashboard" target="_blank" rel="noopener noreferrer">
                  <LayoutDashboard className="h-4 w-4 mr-2"/>
                  Dashboard
              </I18nLink>
            </Button>
          </div>
          <div className="gsap-reveal">
          <Button variant="ghost" asChild className="cursor-pointer">
            <I18nLink href="/sign-in">Sign In</I18nLink>
          </Button>
          </div>
          <div className="gsap-reveal">
          <Button asChild className="cursor-pointer">
            <I18nLink href="/sign-up">Get Started</I18nLink>
          </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" ref={mobileSheetRef} className="w-full sm:w-100 p-0 gap-0 [&>button]:hidden overflow-hidden flex flex-col">
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="space-y-0 p-4 pb-2 border-b">
                <div className="flex items-center gap-2 gsap-mobile-link">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Logo size={16} />
                  </div>
                  <SheetTitle className="text-lg font-semibold">ShadcnStore</SheetTitle>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                      className="cursor-pointer h-8 w-8"
                    >
                      <Moon className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Sun className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    </Button>
                    <LanguageSwitcher></LanguageSwitcher>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="cursor-pointer h-8 w-8">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto">
                <nav className="p-6 space-y-1">
                  {navigationItems.map((item) => (
                    <div key={item.name} className="gsap-mobile-link">
                      {item.hasMegaMenu ? (
                        <Collapsible open={solutionsOpen} onOpenChange={setSolutionsOpen}>
                          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            {item.name}
                            <ChevronDown className={`h-4 w-4 transition-transform ${solutionsOpen ? 'rotate-180' : ''}`} />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 space-y-1">
                            {solutionsItems.map((section, index) => (
                                <div key={section.title} className="space-y-3">
                                  <div
                                      key={`title-${index}`}
                                      className="px-4 mt-5 py-2 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider"
                                  >
                                    {section.title}
                                  </div>
                                  {section.items.map((item) => (
                                      <I18nLink
                                          key={item.title}
                                          href={item.href}
                                          className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                          onClick={() => setIsOpen(false)}
                                      >
                                        {item.title}
                                      </I18nLink>
                                  ))}
                                </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <I18nLink
                          href={item.href}
                          className="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            setIsOpen(false)
                            if (item.href.startsWith('#')) {
                              e.preventDefault()
                              setTimeout(() => smoothScrollTo(item.href), 100)
                            }
                          }}
                        >
                          {item.name}
                        </I18nLink>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t p-6 space-y-4">
                  {/* Primary Actions */}
                  <div className="gsap-mobile-link">
                    <Button variant="outline" size="lg" asChild className="w-full cursor-pointer">
                      <I18nLink href="/dashboard">
                        <LayoutDashboard className="size-4" />
                        Dashboard
                      </I18nLink>
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 gsap-mobile-link">
                    <Button variant="outline" size="lg" asChild className="cursor-pointer">
                      <I18nLink href="/sign-in">Sign In</I18nLink>
                    </Button>
                    <Button asChild size="lg" className="cursor-pointer" >
                      <I18nLink href="/sign-up">Get Started</I18nLink>
                    </Button>
                  </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
