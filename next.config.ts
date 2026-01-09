import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 1. 开启独立打包模式 (之前提到的，部署最快、体积最小，适合 Docker)
    output: "standalone",

    // 2. 强制尾部斜杠 (SEO 关键)
    // true: /about -> /about/
    // false: /about/ -> /about
    // 建议：设为 true。这对 SEO 比较友好，避免因 URL 结尾不一致导致搜索引擎认为是两个页面 (Duplicate Content)。
    trailingSlash: false,

    // 3. 图片优化 (Core Web Vitals 核心)
    // Google 非常看重 LCP (最大内容渲染时间)，优化图片是提分的关键。
    images: {
        // 允许加载外部图片的域名 (安全白名单)
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'your-s3-bucket.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        // 开启更先进的图片格式 (AVIF 比 WebP 更小，WebP 比 JPG 更小)
        formats: ['image/avif', 'image/webp'],
        // 缓存时间 (秒)，默认是 60 秒，生产环境建议改长，比如一天
        minimumCacheTTL: 60,
    },

    // 4. URL 重定向 (SEO 流量迁移关键)
    // 如果你重构了老网站，必须把旧链接 301 到新链接，否则权重全丢。
    async redirects() {
        return [
            {
                source: '/old-blog/:slug', // 旧路径
                destination: '/blog/:slug', // 新路径
                permanent: true, // true = 308/301 (永久移动，SEO 权重传递)
            },
        ];
    },

    // 5. 纯净的控制台日志 (开发体验)
    // Next.js 14+ 新增，让 fetch 的缓存命中/未命中日志更好看
    logging: {
        fetches: {
            fullUrl: true,
        },
    },

    // 6. 禁用 x-powered-by 标头 (安全)
    // 不告诉黑客你用的是 Next.js
    poweredByHeader: false,

    // 极大优化大型库（如 lucide-react 图标库）的加载速度，防止页面加载时引入整个图标包。
    experimental: {
        optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
    },

    // 安全头
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                ],
            },
        ];
    },
};

export default nextConfig;
