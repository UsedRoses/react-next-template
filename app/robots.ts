import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: '/dashboard/', // 禁止爬虫抓取后台页面
        },
        sitemap: 'https://mysaas.com/sitemap.xml',
    }
}