"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { I18nLink } from "@/components/common/I18nLink"
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
  Building2, Rocket, Shield, Database, Palette, Settings, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { useTheme } from '@/hooks/use-theme'
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

  const { t } = useTranslation('navbar')

  // 使用 useMemo 将菜单配置放入组件内部
  const navigationItems = useMemo(() => [
    { name: t('Home'), href: '/landing' },
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
          href: '#free-blocks'
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
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link href="/landing" className="flex items-center space-x-2 cursor-pointer">
            <Logo size={32} />
            <span className="font-bold">
              ShadcnStore
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                {item.hasMegaMenu ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-active:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary cursor-pointer">
                      {item.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <MegaMenu data={solutionsItems}/>
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    className="group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none cursor-pointer"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault()
                      if (item.href.startsWith('#')) {
                        smoothScrollTo(item.href)
                      } else {
                        window.location.href = item.href
                      }
                    }}
                  >
                    {item.name}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTA */}
        <div className="hidden xl:flex items-center space-x-2">
          <ModeToggle variant="ghost" />
          <LanguageSwitcher></LanguageSwitcher>
          <Button variant="outline" asChild className="cursor-pointer">
            <I18nLink href="/dashboard" target="_blank" rel="noopener noreferrer">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </I18nLink>
          </Button>
          <Button variant="ghost" asChild className="cursor-pointer">
            <I18nLink href="/sign-in">Sign In</I18nLink>
          </Button>
          <Button asChild className="cursor-pointer">
            <I18nLink href="/sign-up">Get Started</I18nLink>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[400px] p-0 gap-0 [&>button]:hidden overflow-hidden flex flex-col">
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="space-y-0 p-4 pb-2 border-b">
                <div className="flex items-center gap-2">
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
                    <div key={item.name}>
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
                                        {t(item.title)}
                                      </I18nLink>
                                  ))}
                                </div>
                            ))}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <a
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
                        </a>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t p-6 space-y-4">

                {/* Primary Actions */}
                <div className="space-y-3">
                  <Button variant="outline" size="lg" asChild className="w-full cursor-pointer">
                    <I18nLink href="/dashboard">
                      <LayoutDashboard className="size-4" />
                      Dashboard
                    </I18nLink>
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="lg" asChild className="cursor-pointer">
                      <I18nLink href="/sign-in">Sign In</I18nLink>
                    </Button>
                    <Button asChild size="lg" className="cursor-pointer" >
                      <I18nLink href="/sign-up">Get Started</I18nLink>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
