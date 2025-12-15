import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/api/', '/private/', '/dashboard/'], // 禁止爬虫抓取api和后台页面
        },
        sitemap: 'https://mysaas.com/sitemap.xml',
    }
}